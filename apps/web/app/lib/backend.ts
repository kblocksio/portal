import { GetResourceResponse, GetUserResponse, ResourceQuery, CreateResourceRequest, CreateResourceResponse } from "@repo/shared";
import { parseBlockUri } from "@kblocks/api";

// if VITE_BACKEND_URL is not set, use the current origin
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
if (!VITE_BACKEND_URL) {
  throw new Error("VITE_BACKEND_URL is not set");
}

export const signInUrl = `${VITE_BACKEND_URL}/api/auth/sign-in`;

export const get = async (path: string, params?: Record<string, string>) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = queryParams ? `${VITE_BACKEND_URL}${path}?${queryParams}` : `${VITE_BACKEND_URL}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${path}: ${res.statusText} ${res.status}\n${await res.text()}`);
  }
  return res.json();
};

export const request = async (method: string, path: string, body: any) => {
  try {
    const res = await fetch(`${VITE_BACKEND_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return res.json();
  } catch (error: any) {
    console.log(error);
    throw new Error(JSON.stringify(error));
  }
}


export const getResources = async (query: ResourceQuery): Promise<GetResourceResponse> => {
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

export const createResource = async (req: CreateResourceRequest): Promise<CreateResourceResponse> => {
  const objType = `${req.resourceType.group}/${req.resourceType.version}/${req.resourceType.plural}`;
  return request('POST', `/api/resources/${objType}?system=demo`, req);
};

export const deleteResource = async (objUri: string) => {
  const { group, version, plural, name, system, namespace } = parseBlockUri(objUri);
  return request('DELETE', `/api/resources/${group}/${version}/${plural}/${system}/${namespace}/${name}`, { force: true });
};
