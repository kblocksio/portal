import * as k8s from "@kubernetes/client-node";
import * as request from "request";
import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV ?? "dev"}` });

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
    "k8s Kubernetes configuration not found in environment variables. Falling back to default config.",
  );
  kc.loadFromDefault();
}

export async function kubernetesRequest(
  pathname: string,
  options?: request.Options & Omit<request.Options, "url" | "uri">,
): Promise<Response> {
  const cluster = kc.getCurrentCluster();
  if (!cluster) {
    return new Response("No cluster found", { status: 500 });
  }

  const server = cluster.server;
  const parts = [server];
  parts.push(...pathname.split("/").filter((part) => part !== ""));

  const url = parts.join("/");

  const req = {
    url,
    ...options,
  };

  await kc.applyToRequest(req);

  return new Promise((resolve, reject) => {
    request.get(req, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`${res.statusMessage} ${url}`));
      }
      return resolve(new Response(body));
    });
  });
}
