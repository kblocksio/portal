import express, { Express } from "express";
import cors from "cors";
import { ResourceType, ResourceQuery, Resource } from "@repo/shared";
import { kubernetesRequest } from "./k8s";
import projects from "./mock-data/projects.json";
import repositories from "./mock-data/repositories.json";
import * as k8s from "@kubernetes/client-node";
import { exchangeCodeForTokens } from "./github.js";
import { createServerSupabase } from "./supabase.js";

const kblocksConfigMap = process.env.KBLOCKS_CONFIG_MAP_ANNOTATION;
const kblocksNamespace = process.env.KBLOCKS_NAMESPACE;
const kblocksGroupName = process.env.KBLOCKS_GROUP_NAME;

if (!kblocksConfigMap) {
  throw new Error("KBLOCKS_CONFIG_MAP_ANNOTATION is not set");
}
if (!kblocksNamespace) {
  throw new Error("KBLOCKS_NAMESPACE is not set");
}
if (!kblocksGroupName) {
  throw new Error("KBLOCKS_GROUP_NAME is not set");
}

// Create and configure KubeConfig
const kc = new k8s.KubeConfig();

if (
  process.env.KUBE_API_SERVER &&
  process.env.KUBE_CA_DATA &&
  process.env.KUBE_CERT_DATA &&
  process.env.KUBE_KEY_DATA
) {
  kc.loadFromOptions({
    clusters: [
      {
        name: process.env.KUBE_CLUSTER_NAME || "default-cluster",
        server: process.env.KUBE_API_SERVER,
        caData: process.env.KUBE_CA_DATA,
      },
    ],
    users: [
      {
        name: process.env.KUBE_USER_NAME || "default-user",
        certData: process.env.KUBE_CERT_DATA,
        keyData: process.env.KUBE_KEY_DATA,
      },
    ],
    contexts: [
      {
        name: process.env.KUBE_CONTEXT_NAME || "default-context",
        user: process.env.KUBE_USER_NAME || "default-user",
        cluster: process.env.KUBE_CLUSTER_NAME || "default-cluster",
      },
    ],
    currentContext: process.env.KUBE_CONTEXT_NAME || "default-context",
  });
} else {
  console.warn(
    "server Kubernetes configuration not found in environment variables. Falling back to default config.",
  );
  kc.loadFromDefault();
}

const crdClient = kc.makeApiClient(k8s.ApiextensionsV1Api);

const port = process.env.PORT || 3001;
const app: Express = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.get("/api/resources", async (req, res) => {
  const params = req.query as unknown as ResourceQuery;

  const url = [];

  if (params.group === "core") {
    url.push("api");
  } else {
    url.push("apis");
    url.push(params.group);
  }

  url.push(params.version);
  url.push(params.plural);

  const result = await kubernetesRequest(url.join("/"));
  const data = (await result.json()) as { items: Resource[] };

  return res.status(200).json(data);
});

app.get("/api/projects", async (_, res) => {
  return res.status(200).json(projects);
});

app.get("/api/repositories", async (_, res) => {
  return res.status(200).json(repositories);
});

app.get("/api/types", async (_, res) => {
  try {
    const crds = await crdClient.listCustomResourceDefinition();
    const filteredCrds = crds.body.items.filter(
      (crd) => crd.spec.group === kblocksGroupName,
    );

    const crdsResult: ResourceType[] = [];

    for (const crd of filteredCrds) {
      const result: ResourceType = {
        kind: crd.spec.names.kind,
        group: crd.spec.group,
        plural: crd.spec.names.plural,
        version: crd.spec.versions[0].name,
      };

      if (crd?.metadata?.annotations) {
        const configmapName = crd.metadata.annotations[kblocksConfigMap];
        const k8sConfigMapApi = kc.makeApiClient(k8s.CoreV1Api);
        const configMap = await k8sConfigMapApi.readNamespacedConfigMap(
          configmapName,
          kblocksNamespace,
        );
        const crdConfigMap = configMap.body.data;
        result.color = crdConfigMap?.color;
        result.icon = crdConfigMap?.icon?.replace("heroicon://", "");
        result.readme = crdConfigMap?.readme;
        result.openApiSchema = crd.spec.versions[0]?.schema?.openAPIV3Schema;
        crdsResult.push(result);
      }
    }
    return res.status(200).json(crdsResult);
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
});

app.get("/api/auth/sign-in", async (req, res) => {
  const supabase = createServerSupabase(req, res);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.WEBSITE_ORIGIN}/api/auth/callback/supabase`,
    },
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.redirect(data.url);
});

app.get("/api/auth/callback/supabase", async (req, res) => {
  const code = req.query.code?.toString();
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const supabase = createServerSupabase(req, res);
  await supabase.auth.exchangeCodeForSession(code);

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.append("client_id", process.env.GITHUB_CLIENT_ID!);
  url.searchParams.append(
    "redirect_uri",
    `${process.env.WEBSITE_ORIGIN}/api/auth/callback/github`,
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

  return res.redirect(process.env.WEBSITE_ORIGIN!);
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
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }

  const { Octokit } = await import("octokit");

  const octokit = new Octokit({
    auth: data.access_token,
  });

  const { data: installations } =
    await octokit.rest.apps.listInstallationsForAuthenticatedUser({
      page: 0,
      per_page: 100,
    });
  return res.status(200).json(installations.installations);
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
  return res.status(200).json(user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
