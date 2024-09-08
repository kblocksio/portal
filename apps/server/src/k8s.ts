import * as k8s from "@kubernetes/client-node";
import * as request from "request";

export async function kubernetesRequest(
  pathname: string,
  options?: request.Options & Omit<request.Options, "url" | "uri">,
): Promise<Response> {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const server = kc.getCurrentCluster()?.server;

  if (!server) {
    return new Response("No server found", { status: 500 });
  }

  const parts = [server];
  parts.push(...pathname.split("/").filter((part) => part !== ""));

  const url = parts.join("/");

  const req = {
    url,
    ...options,
  };

  await kc.applyToRequest(req);

  return new Promise((resolve, reject) => {
    return request.get(req, (err, res, body) => {
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
