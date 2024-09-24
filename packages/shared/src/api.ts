import { Resource, ResourceType, ResourceQuery } from "./types";
import { User } from "@supabase/supabase-js";

export type GetResourceResponse = {
  items: Resource[];
};

export type GetUserResponse = {
  user: User;
};

export type GetTypesResponse = {
  types: ResourceType[];
};

export type CreateResourceRequest = {
  resource: ResourceType;
  providedValues: any;
};

export type CreateResourceResponse = {
  
};
