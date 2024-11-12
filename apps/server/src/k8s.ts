import * as k8s from "@kubernetes/client-node";
import * as request from "request";
import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV ?? "dev"}` });

// Create and configure KubeConfig
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

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
    request.get(req, (err: any, res: request.Response, body: any) => {
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
