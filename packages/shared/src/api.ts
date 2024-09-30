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
  /**
   * A map of resource type names to their definitions..
   * TYpe is: `group/version/plural`
   */
  types: Record<string, ResourceType>;
};

export type CreateResourceRequest = {
  resourceType: ResourceType;
  providedValues: any;
};

export type CreateResourceResponse = {

};
