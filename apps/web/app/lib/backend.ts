import { GetResourceResponse, GetUserResponse, ResourceQuery, GetTypesResponse, CreateResourceRequest, CreateResourceResponse } from "@repo/shared";

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

export const post = async (path: string, body: any) => {
  const res = await fetch(`${VITE_BACKEND_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
};


export const getResources = async (query: ResourceQuery): Promise<GetResourceResponse> => {
  return get(`/api/resources`, {
    group: query.group ?? "",
    version: query.version ?? "",
    plural: query.plural ?? "",
  });
};

export const getTypes = async (): Promise<GetTypesResponse> => {
  return get(`/api/types`);
};

export const getUser = async (): Promise<GetUserResponse> => {
  return get(`/api/user`);
};

export const createResource = async (req: CreateResourceRequest): Promise<CreateResourceResponse> => {
  const objType = `${req.resourceType.group}/${req.resourceType.version}/${req.resourceType.plural}`;
  return post(`/api/resources/${objType}?system_id=demo`, req);
};
