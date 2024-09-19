import { ResourceQuery, Resource } from "@repo/shared";
import { kubernetesRequest } from "./k8s";

export const getResources = async (request: Request) => {
  const url = new URL(request.url);
  const params = Object.fromEntries(
    url.searchParams,
  ) as unknown as ResourceQuery;

  const urlParts = [];

  if (params.group === "core") {
    urlParts.push("api");
  } else {
    urlParts.push("apis");
    urlParts.push(params.group);
  }

  urlParts.push(params.version);
  urlParts.push(params.plural);

  const result = await kubernetesRequest(urlParts.join("/"));
  const data = (await result.json()) as { items: Resource[] };
  return data;
};
