import { ResourceType } from "./types";
import { User } from "@supabase/supabase-js";
import * as kblocks from "@kblocks/cli/types";

export type GetResourceResponse = {
  objects: kblocks.ObjectEvent[];
};

export type GetUserResponse = {
  user: User;
};

export type GetTypesResponse = {
  types: ResourceType[];
};

export type CreateResourceRequest = {
  resourceType: ResourceType;
  providedValues: any;
};

export type CreateResourceResponse = {

};
