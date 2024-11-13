import * as k8s from "@kubernetes/client-node";
import * as request from "request";
import { config } from "dotenv";
import { Response as RequestResponse } from 'request'

config({ path: `.env.${process.env.NODE_ENV ?? "dev"}` });

// Create and configure KubeConfig
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

export async function kubernetesRequest(
  pathname: string,
  options?: request.Options & Omit<request.Options, "url" | "uri">,
): Promise<RequestResponse> {
  const cluster = kc.getCurrentCluster();
  if (!cluster) {
    throw new Error("No cluster found");
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
    request.get(req, (
      err: Error | null, 
      res: RequestResponse, 
      body: any
    ) => {
      if (err) {
        return reject(err);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`${res.statusMessage} ${url}`));
      }
      return resolve(res);
    });
  });
}
