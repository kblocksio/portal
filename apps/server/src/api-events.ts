import type { ApiObject, LifecycleEvent } from "@kblocks/api";

// TODO: Had to copy the `@kblocks/api` types here because it incorrectly types timestamp as `Date`. Would be nice to fix this in a better way.

export interface EventBaseTimestampString {
  objUri: string;
  objType: string;
  timestamp: string;
  requestId: string;
}

export interface ObjectEventTimestampString extends EventBaseTimestampString {
  type: "OBJECT";
  object: ApiObject | {};
  reason: "CREATE" | "UPDATE" | "DELETE" | "SYNC" | "READ";
}

export interface LifecycleEventTimestampString
  extends EventBaseTimestampString {
  type: "LIFECYCLE";
  event: LifecycleEvent["event"];
}

export enum LogLevel {
  DEBUG,
  INFO,
  WARNING,
  ERROR,
}

export interface LogEventTimestampString extends EventBaseTimestampString {
  type: "LOG";
  level: LogLevel;
  message: string;

  /**
   * The ID of the log group this message belongs to.
   */
  logId?: string;
  parentLogId?: string;
}

export interface ErrorEventTimestampString extends EventBaseTimestampString {
  type: "ERROR";
  message: string;
  body?: any;
  stack?: string;
  explanation?: any;
}

export type WorkerEventTimestampString =
  | ObjectEventTimestampString
  | LogEventTimestampString
  | LifecycleEventTimestampString
  | ErrorEventTimestampString;
