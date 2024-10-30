import { User } from "@supabase/supabase-js";
import * as kblocks from "@kblocks/api";

export type GetResourceResponse = {
  objects: kblocks.ObjectEvent[];
};

export type GetUserResponse = {
  user: User;
};

export type GetTypesResponse = {
  /**
   * A map of resource type names to their definitions..
   * Type is: `group/version/plural`
   */
  types: Record<string, kblocks.Manifest["definition"]>;
};

export type GetLogsResponse = {
  objUri: string;
  logs: kblocks.LogEvent[];
};

export type GetEventsResponse = {
  objUri: string;
  events: kblocks.WorkerEvent[];
};

export type CreateResourceResponse = {};
