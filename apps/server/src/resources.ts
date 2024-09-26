import { subscribeToEvents } from "./pubsub";
import * as kblocks from "@kblocks/cli/types";

export const all: Record<string, kblocks.ApiObject> = {};

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
  } catch (error) {
    console.error("Error parsing event", error);
  }
});

