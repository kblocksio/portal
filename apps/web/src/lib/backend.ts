import {
  GetResourceResponse,
  GetUserResponse,
  ResourceQuery,
  CreateResourceResponse,
} from "@kblocks-portal/shared";
import { ApiObject, parseBlockUri } from "@kblocks/api";
import type { ExtendedResourceType } from "@/hooks/use-resource-types";

export const signInUrl = `/api/auth/sign-in`;

export const get = async (path: string, params?: Record<string, string>) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `${path}?${queryParams}` : `${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `${path}: ${res.statusText} ${res.status}\n${await res.text()}`,
    );
  }
  return res.json();
};

export const request = async (method: string, path: string, body?: any) => {
  try {
    const res = await fetch(`${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  } catch (error: any) {
    console.log(error);
    throw new Error(JSON.stringify(error));
  }
};

export const getResources = async (
  query: ResourceQuery,
): Promise<GetResourceResponse> => {
  return get(`/api/resources`, {
    group: query.group ?? "",
    version: query.version ?? "",
    plural: query.plural ?? "",
  });
};

export const getUser = async (): Promise<GetUserResponse> => {
  return get(`/api/user`);
};

export const rejectUser = async (): Promise<void> => {
  return get(`/api/auth/reject`);
};

export const createResource = async (
  system: string,
  type: ExtendedResourceType,
  obj: ApiObject,
): Promise<CreateResourceResponse> => {
  const objType = `${type.group}/${type.version}/${type.plural}`;

  console.log("Creating resource", objType, obj);

  return request("POST", `/api/resources/${objType}?system=${system}`, obj);
};

export const deleteResource = async (objUri: string) => {
  const { group, version, plural, name, system, namespace } =
    parseBlockUri(objUri);
  return request(
    "DELETE",
    `/api/resources/${group}/${version}/${plural}/${system}/${namespace}/${name}`,
    { force: true },
  );
};

export const reapplyResource = async (objUri: string) => {
  const { group, version, plural, name, system, namespace } =
    parseBlockUri(objUri);
  return request(
    "PATCH",
    `/api/resources/${group}/${version}/${plural}/${system}/${namespace}/${name}`,
    {
      metadata: {
        labels: { "kblocks.io/requested-apply": Date.now().toString() },
      },
    },
  );
};

export const readResource = async (objUri: string) => {
  const { group, version, plural, name, system, namespace } =
    parseBlockUri(objUri);
  return request(
    "POST",
    `/api/resources/${group}/${version}/${plural}/${system}/${namespace}/${name}/read`,
  );
};
