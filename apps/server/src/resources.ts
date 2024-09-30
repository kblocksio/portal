import { subscribeToEvents } from "./pubsub";
import * as kblocks from "@kblocks/cli/types";

export const all: Record<string, kblocks.ApiObject> = {};

export const logs: Record<string, kblocks.LogEvent[]> = {};

subscribeToEvents(message => {
  try {
    const event = JSON.parse(message) as kblocks.WorkerEvent;

    if (event.type === "OBJECT") {
      if (Object.keys(event.object ?? {}).length === 0) {
        delete all[event.objUri];
      } else {
        all[event.objUri] = event.object as kblocks.ApiObject;
      }

      return;
    }

    if (event.type === "PATCH") {
      all[event.objUri] = { ...all[event.objUri], ...event.patch };
      return;
    }

    if (event.type === "LOG") {
      const { objUri } = event;
      const existingLogs = logs[objUri] ?? [];
      existingLogs.push(event);
      logs[objUri] = existingLogs;
      return;
    }

  } catch (error) {
    console.error("Error parsing event", error);
  }
});

