import express from "express";
import cors from "cors";
import { ResourceType, GetUserResponse, GetTypesResponse, GetResourceResponse, CreateResourceRequest, GetLogsResponse } from "@repo/shared";
import projects from "./mock-data/projects.json";
import { exchangeCodeForTokens } from "./github.js";
import { createServerSupabase } from "./supabase.js";
import expressWs from "express-ws";
import { getEnv } from "./util";
import * as pubsub from "./pubsub";
import { blockTypeFromUri, formatBlockUri, ObjectEvent, WorkerEvent } from "@kblocks/api";
import { createCustomResourceInstance } from "./create-resource-utils";
import { getAllObjects, handleEvent, loadLogs } from "./storage";
import { whitelist } from "./whitelist";

const WEBSITE_ORIGIN = getEnv("WEBSITE_ORIGIN");

const port = process.env.PORT ?? 3001;

const { app } = expressWs(express());

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

console.log("express-ws, will you work?");

app.get("/", async (_, res) => {
  return res.status(200).json({ message: "Hello, portal-backend!" });
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

app.ws("/api/control/:group/:version/:plural", (ws, req) => {
  const { group, version, plural } = req.params;
  const { system: sys, system_id } = req.query as unknown as { system?: string, system_id?: string };

  const system = sys ?? system_id;

  if (!group || !version || !plural || !system) {
    console.error("Invalid control connection request. Missing one of group, version, plural, system query params.");
    console.log("Query params:", req.query);
    return ws.close();
  }

  const resourceType = `${group}/${version}/${plural}`;
  console.log(`control connection: ${resourceType} for ${system}`);

  const { unsubscribe } = pubsub.subscribeToControlRequests({ system, group, version, plural }, (message) => {
    console.log(`sending control message to ${resourceType}:`, message);
    ws.send(message);
  });

  ws.on("close", () => {
    console.log(`control connection closed: ${resourceType} for system ${system}`);
    unsubscribe();
  });
});

// publish an event to the events stream (called by workers)
app.post("/api/events", (req, res) => {
  const body = JSON.stringify(req.body);
  console.log("EVENT:", body);
  pubsub.publishEvent(body);
  handleEvent(req.body as WorkerEvent); // <-- runs in the background
  return res.status(200);
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
    });
  }

  const response: GetResourceResponse = { objects };
  return res.status(200).json(response);
});

app.get("/api/projects", async (_, res) => {
  return res.status(200).json(projects);
});

app.get("/api/types", async (_, res) => {
  const result: Record<string, ResourceType> = {};

  const all = await getAllObjects();

  // find all the kblocks.io/v1/blocks objects
  for (const [objUri, object] of Object.entries(all)) {
    if (!objUri.startsWith("kblocks://kblocks.io/v1/blocks")) {
      continue;
    }

    const type = `${object.spec.group}/${object.spec.version}/${object.spec.plural}`;
    result[type] = object.spec as ResourceType;
  }

  return res.status(200).json({ types: result } as GetTypesResponse);
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
  const logs = await loadLogs(objUri);
  return res.status(200).json({ objUri, logs } as GetLogsResponse);
});

app.post("/api/resources/:group/:version/:plural", async (req, res) => {
  const { group, version, plural } = req.params;
  const apiVersion = `${group}/${version}`;

  const system = req.query.system as string;
  if (!system) {
    return res.status(400).json({ error: "'system' is required as a query param" });
  }

  const { resourceType, providedValues } = req.body as CreateResourceRequest;
  const obj = await createCustomResourceInstance(resourceType, providedValues, "default");

  console.log("creating object:", JSON.stringify(obj));

  // verify that the request has the correct `apiVersion` and `kind`
  if (obj.apiVersion !== apiVersion) {
    return res.status(400).json({ error: `Invalid "apiVersion" in object. Expected ${apiVersion}, but got ${obj.apiVersion}` });
  }

  // verify that the request as a metadata.name
  if (!obj.metadata?.name) {
    return res.status(400).json({ error: `Object is missing "metadata.name" field` });
  }

  pubsub.publishControlRequest({ system, group, version, plural }, {
    type: "APPLY",
    object: obj,
  });

  return res.status(200).json({ message: "Create request accepted", objType: `${group}/${version}/${plural}`, obj });
});

app.delete("/api/resources/:group/:version/:plural/:system/:namespace/:name", async (req, res) => {
  const { group, version, plural, system, namespace, name } = req.params;

  const objUri = formatBlockUri({
    group,
    version,
    plural,
    system,
    namespace,
    name,
  });

  pubsub.publishControlRequest({ system, group, version, plural }, {
    type: "DELETE",
    objUri,
  });

  return res.status(200).json({ message: "Delete request accepted" });
});


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

app.get("/api/auth/callback/supabase", async (req, res) => {
  const { error, error_description } = req.query;
  if (error) {
    console.error(`Supabase auth error: ${error}, Description: ${error_description}`);
    return res.redirect(`${WEBSITE_ORIGIN}/auth-error?error=${error}&description=${error_description}`);
  }

  const code = req.query.code?.toString();

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const supabase = createServerSupabase(req, res);
  const { error: supabaseError } = await supabase.auth.exchangeCodeForSession(code);
  if (supabaseError) {
    return res.redirect(`${WEBSITE_ORIGIN}/auth-error?error=${supabaseError}`);
  }

  console.log("client_id", process.env.GITHUB_CLIENT_ID);

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

  // check if the user is whitelisted
  if (!whitelist.includes(user.data.user?.email ?? "")) {
    console.log("user is not whitelisted", user.data.user?.email);
    return res.status(403).json({ error: "User is not whitelisted" });
  }

  console.log("user is whitelisted", user.data.user?.email);

  const tokens = await exchangeCodeForTokens(code.toString());

  const { error } = await supabase.from("user_ghtokens").upsert([
    {
      user_id: user.data.user?.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      refresh_token_expires_in: tokens.refresh_token_expires_in,
      token_type: tokens.token_type,
      scope: tokens.scope,
    },
  ]);

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }

  const next = (req.query.next ?? "/").toString();
  return res.redirect(303, `${WEBSITE_ORIGIN}/${next.slice(1)}`)
});

app.get("/api/github/installations", async (req, res) => {
  const supabase = createServerSupabase(req, res);
  const user = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("user_ghtokens")
    .select("access_token")
    .eq("user_id", user.data.user?.id)
    .single();
  if (error) {
    console.error("error getting access token", error);
    return res.status(500).json({ message: "Server error" });
  }

  const { Octokit } = await import("octokit");

  const octokit = new Octokit({
    auth: data.access_token,
  });

  try {
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
  const supabase = createServerSupabase(req, res);
  const user = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("user_ghtokens")
    .select("access_token")
    .eq("user_id", user.data.user?.id)
    .single();
  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }

  const { Octokit } = await import("octokit");

  const octokit = new Octokit({
    auth: data.access_token,
  });

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
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }

  return res.status(200).json(users.users);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
