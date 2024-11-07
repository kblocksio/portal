import express from "express";
import cors from "cors";
import {
  GetUserResponse,
  GetTypesResponse,
  GetResourceResponse,
  GetLogsResponse,
  GetEventsResponse,
} from "@repo/shared";
import projects from "./mock-data/projects.json";
import { exchangeCodeForTokens } from "./github.js";
import { createServerSupabase } from "./supabase.js";
import expressWs from "express-ws";
import { getEnv, getUserOctokit } from "./util";
import * as pubsub from "./pubsub";
import {
  ApiObject,
  blockTypeFromUri,
  formatBlockUri,
  Manifest,
  ObjectEvent,
} from "@kblocks/api";
import {
  getAllObjects,
  loadEvents,
  getObject,
  resetStorage,
  deleteObject,
} from "./storage";
import { categories } from "./categories";

const WEBSITE_ORIGIN = getEnv("WEBSITE_ORIGIN");
const NON_PRIMARY_ENVIRONMENT = process.env.NON_PRIMARY_ENVIRONMENT;

const port = process.env.PORT ?? 3001;

const { app } = expressWs(express());

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

console.log("express-ws, will you work?");

app.get("/", async (_, res) => {
  return res.status(200).json({ message: "Hello, kblocks backend!" });
});

app.ws("/api/events", (ws) => {
  console.log("Client connected");

  const callback = (message: string) => {
    ws.send(message);
  };

  pubsub.subscribeToEvents(callback);

  ws.on("close", () => {
    console.log("/api/events client disconnected");
    pubsub.unsubscribeFromEvents(callback);
  });
});

app.ws("/api/control/:group/:version/:plural", async (ws, req) => {
  const { group, version, plural } = req.params;
  const { system: sys, system_id } = req.query as unknown as {
    system?: string;
    system_id?: string;
  };

  const system = sys ?? system_id;

  if (!group || !version || !plural || !system) {
    console.error(
      "Invalid control connection request. Missing one of group, version, plural, system query params.",
    );
    console.log("Query params:", req.query);
    return ws.close();
  }

  const resourceType = `${group}/${version}/${plural}`;
  console.log(`control connection: ${resourceType} for ${system}`);

  const { unsubscribe } = await pubsub.subscribeToControlRequests(
    { system, group, version, plural },
    (message) => {
      console.log(`sending control message to ${resourceType}:`, message);
      ws.send(message);
    },
  );

  ws.on("close", () => {
    console.log(
      `control connection closed: ${resourceType} for system ${system}`,
    );
    unsubscribe();
  });
});

// publish an event to the events stream (called by workers)
app.post("/api/events", async (req, res) => {
  await pubsub.publishEvent(req.body);
  return res.sendStatus(200);
});

app.get("/api/resources", async (_, res) => {
  const objects: ObjectEvent[] = [];

  const all = await getAllObjects();

  for (const [objUri, object] of Object.entries(all)) {
    objects.push({
      type: "OBJECT",
      object,
      objUri,
      objType: blockTypeFromUri(objUri),
      reason: "SYNC",
      timestamp: new Date(),
    });
  }

  const response: GetResourceResponse = { objects };
  return res.status(200).json(response);
});

app.get("/api/projects", async (_, res) => {
  return res.status(200).json(projects);
});

app.get("/api/categories", async (_, res) => {
  return res.status(200).json(categories);
});

app.get("/api/types", async (_, res) => {
  const result: GetTypesResponse = { types: {} };

  const all = await getAllObjects();

  // find all the kblocks.io/v1/blocks objects
  for (const [objUri, object] of Object.entries(all) as [
    string,
    ApiObject & { spec: Manifest },
  ][]) {
    if (!objUri.startsWith("kblocks://kblocks.io/v1/blocks")) {
      continue;
    }

    const def = object.spec?.definition;
    if (!def) {
      console.warn(
        `block object ${objUri} has no definition:`,
        JSON.stringify(object),
      );
      continue;
    }

    const type = `${def.group}/${def.version}/${def.plural}`;
    result.types[type] = def;
  }

  return res.status(200).json(result);
});

app.get("/api/resources/:group/:version/:plural/:system/:namespace/:name", async (req, res) => {
  const { group, version, plural, system, namespace, name } = req.params;
  const objUri = formatBlockUri({
    group,
    version,
    plural,
    system,
    namespace,
    name,
  });

  const obj = await getObject(objUri);
  if (!obj) {
    return res.status(404).json({ error: `Block ${objUri} not found` });
  }
  
  return res.status(200).json(obj);
});

app.get("/api/resources/:group/:version/:plural/:system/:namespace/:name/logs", async (req, res) => {
  const { group, version, plural, system, namespace, name } = req.params;
  const objUri = formatBlockUri({
    group,
    version,
    plural,
    system,
    namespace,
    name,
  });
  const logs = (await loadEvents(objUri)).filter((e) => e.type === "LOG");
  return res.status(200).json({ objUri, logs } as GetLogsResponse);
});

app.get("/api/resources/:group/:version/:plural/:system/:namespace/:name/events", async (req, res) => {
  const { group, version, plural, system, namespace, name } = req.params;
  const objUri = formatBlockUri({
    group,
    version,
    plural,
    system,
    namespace,
    name,
  });
  const events = await loadEvents(objUri);
  return res.status(200).json({ objUri, events } as GetEventsResponse);
});

app.post("/api/resources/:group/:version/:plural", async (req, res) => {
  const { group, version, plural } = req.params;
  const apiVersion = `${group}/${version}`;

  const system = req.query.system as string;
  if (!system) {
    return res
      .status(400)
      .json({ error: "'system' is required as a query param" });
  }

  const obj = req.body as ApiObject;
  
  const objUri = formatBlockUri({
    group,
    version,
    plural,
    system,
    namespace: obj.metadata?.namespace ?? "default",
    name: obj.metadata?.name,
  });

  const objType = blockTypeFromUri(objUri);

  console.log("creating object:", JSON.stringify(obj));

  // patch the status and add a "Ready" condition indicating that the object is pending
  obj.status = {
    ...obj.status,

    conditions: [
      ...(obj.status?.conditions ?? []).filter((c) => c.type !== "Ready"),
      {
        type: "Ready",
        status: "False",
        reason: "Pending",
        message: "Pending",
        lastTransitionTime: new Date().toISOString(),
      }
    ],
  };

  // we are going to publish a synthetic OBJECT event to the event stream which will serve
  // as a placeholder for the object until it is actually created and the real OBJECT
  // event is published by the worker.
  await pubsub.publishEvent({
    type: "OBJECT",
    object: obj,
    objUri,
    objType,
    reason: "CREATE",
    timestamp: new Date(),
  });

  sanitizeObject(obj);

  // verify that the request has the correct `apiVersion` and `kind`
  if (obj.apiVersion !== apiVersion) {
    return res.status(400).json({
      error: `Invalid "apiVersion" in object. Expected ${apiVersion}, but got ${obj.apiVersion}`,
    });
  }

  // verify that the request as a metadata.name
  if (!obj.metadata?.name) {
    return res
      .status(400)
      .json({ error: `Object is missing "metadata.name" field` });
  }

  await pubsub.publishControlRequest(
    { system, group, version, plural },
    {
      type: "APPLY",
      object: obj,
    },
  );

  return res.status(200).json({
    message: "Create request accepted",
    objType: `${group}/${version}/${plural}`,
    obj,
  });
});

app.patch(
  "/api/resources/:group/:version/:plural/:system/:namespace/:name",
  async (req, res) => {
    const { group, version, plural, system, namespace, name } = req.params;
    const objUri = formatBlockUri({
      group,
      version,
      plural,
      system,
      namespace,
      name,
    });

    if (!system) {
      return res
        .status(400)
        .json({ error: "'system' is required as a query param" });
    }

    const obj = req.body as ApiObject;

    console.log("patching object:", JSON.stringify(obj));

    sanitizeObject(obj);

    pubsub.publishControlRequest(
      { system, group, version, plural },
      {
        type: "PATCH",
        objUri,
        object: obj,
      },
    );

    return res.status(200).json({
      message: "Patch request accepted",
      objType: `${group}/${version}/${plural}`,
      obj,
    });
  },
);

app.delete(
  "/api/resources/:group/:version/:plural/:system/:namespace/:name",
  async (req, res) => {
    const { group, version, plural, system, namespace, name } = req.params;
    const force = req.query["force"] !== undefined && req.query["force"] !== "false";

    const objUri = formatBlockUri({
      group,
      version,
      plural,
      system,
      namespace,
      name,
    });

    pubsub.publishControlRequest(
      { system, group, version, plural },
      {
        type: "DELETE",
        objUri,
      },
    );

    // if this is a kblocks.io/v1.Block object, we need to delete the object from storage
    if (force || objUri.startsWith("kblocks://kblocks.io/v1/blocks/")) {
      await deleteObject(objUri);
      return res.status(200).json({ message: `Block ${objUri} deleted` });
    }

    return res.status(200).json({ message: "Delete request accepted" });
  },
);

app.post(
  "/api/resources/:group/:version/:plural/:system/:namespace/:name/read",
  async (req, res) => {
    const { group, version, plural, system, namespace, name } = req.params;
    const objUri = formatBlockUri({
      group,
      version,
      plural,
      system,
      namespace,
      name,
    });

    if (!system) {
      return res
        .status(400)
        .json({ error: "'system' is required as a query param" });
    }

    console.log("reading object:", objUri);

    pubsub.publishControlRequest(
      { system, group, version, plural },
      {
        type: "READ",
        objUri,
      },
    );

    return res.status(200).json({
      message: "Read request accepted",
    });
  },
);

app.get("/api/auth/sign-in", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${WEBSITE_ORIGIN}/api/auth/callback/supabase`,
    },
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.redirect(data.url);
});

app.get("/api/auth/sign-out", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  await supabase.auth.signOut();
  return res.redirect("/");
});

app.get("/api/auth/reject", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  await supabase.auth.signOut();
  return res
    .status(200)
    .json({ error: "User is not whitelisted and was signed out" });
});

app.get("/api/auth/callback/supabase", async (req, res) => {
  const { error, error_description } = req.query;
  if (error) {
    console.error(
      `Supabase auth error: ${error}, Description: ${error_description}`,
    );
    return res.redirect(
      `${WEBSITE_ORIGIN}/auth-error?error=${error}&description=${error_description}`,
    );
  }

  const code = req.query.code?.toString();

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const supabase = createServerSupabase(req, res);
  const { error: supabaseError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (supabaseError) {
    return res.redirect(`${WEBSITE_ORIGIN}/auth-error?error=${supabaseError}`);
  }

  console.log("client_id", process.env.GITHUB_CLIENT_ID);

  if (NON_PRIMARY_ENVIRONMENT) {
    console.log("non-primary environment, skipping additional github auth");
    return res.redirect(303, `${WEBSITE_ORIGIN}/`);
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.append("client_id", process.env.GITHUB_CLIENT_ID!);
  url.searchParams.append("scope", "repo, org:read");
  url.searchParams.append(
    "redirect_uri",
    `${WEBSITE_ORIGIN}/api/auth/callback/github`,
  );
  return res.redirect(url.toString());
});

app.get("/api/auth/callback/github", async (req, res) => {
  const code = req.query.code?.toString();
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const supabase = createServerSupabase(req, res);

  const user = await supabase.auth.getUser();
  if (user.error) {
    return res.redirect(
      `${WEBSITE_ORIGIN}/auth-error?error=${user.error.name}`,
    );
  }

  const tokens = await exchangeCodeForTokens(code.toString());

  const { error } = await supabase.from("user_ghtokens").upsert([
    {
      user_id: user.data.user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      refresh_token_expires_in: tokens.refresh_token_expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
      expires_at: new Date(
        new Date().getTime() + tokens.expires_in * 1000,
      ).toISOString(),
    },
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }

  const next = (req.query.next ?? "/").toString();
  return res.redirect(303, `${WEBSITE_ORIGIN}/${next.slice(1)}`);
});

app.get("/api/github/installations", async (req, res) => {
  try {
    const octokit = await getUserOctokit(req, res);
    const { data: installations } =
      await octokit.rest.apps.listInstallationsForAuthenticatedUser({
        page: 0,
        per_page: 100,
      });
    return res.status(200).json(installations.installations);
  } catch (error) {
    console.error("error getting installations", error);
    if ((error as any).status === 401) {
      return res.redirect("/api/auth/sign-out");
    }
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/github/repositories", async (req, res) => {
  const installation_id = Number(req.query.installation_id?.toString());
  if (!installation_id) {
    return res.status(400).json({ error: "Installation ID is required" });
  }
  const octokit = await getUserOctokit(req, res);
  const { data: repositories } =
    await octokit.rest.apps.listInstallationReposForAuthenticatedUser({
      installation_id,
    });
  return res.status(200).json(repositories.repositories);
});

app.get("/api/user", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  const user = await supabase.auth.getUser();
  return res.status(200).json({ user: user.data.user } as GetUserResponse);
});

app.get("/api/users", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }

  return res.status(200).json(users.users);
});

app.post("/api/reset", async (req, res) => {
  if (req.query["password"] !== "kblocks4422") {
    return res.status(401).json({ error: "Invalid password" });
  }

  await resetStorage();
  return res.status(200).json({ message: "Storage reset" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/**
 * Clean up the object to remove fields that shouldn't be sent to apply requests.
 */
function sanitizeObject(obj: ApiObject) {
  const metadata: any = obj.metadata;
  if (metadata) {
    delete metadata.managedFields;
    delete metadata.generation;
    delete metadata.resourceVersion;
    delete metadata.uid;
    delete metadata.creationTimestamp;
    delete metadata.deletionTimestamp;
    delete metadata.deletionGracePeriodSeconds;
    delete metadata.ownerReferences;
    delete metadata.finalizers;
    delete metadata.generation;
  }

  delete obj.status;
}

export default app;
