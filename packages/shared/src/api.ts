import { User } from "@supabase/supabase-js";
import * as kblocks from "@kblocks/api";
import { ResourceType } from "./types";

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

export type GetLogsResponse = {
  objUri: string;
  logs: kblocks.LogEvent[];
};

export type CreateResourceResponse = { };
