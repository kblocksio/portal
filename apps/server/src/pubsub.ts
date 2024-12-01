import { EventEmitter } from "stream";
import { ControlCommand, WorkerEvent } from "@kblocks/api";
import { createRedisClient, APP_EVENTS_CHANNEL, KBLOCKS_CONTROL_CHANNEL } from "./redis.js";
import { handleEvent } from "./storage";

const publishClient = createRedisClient();
publishClient.connect().catch(console.error);

const events = new EventEmitter();

const subscribeClient = createRedisClient();

subscribeClient
  .connect()
  .then(() => {
    subscribeClient.subscribe(APP_EVENTS_CHANNEL, (message) => {
      console.log("Received app message:", message);
      events.emit("event", message);
    });
  })
  .catch(console.error);

export async function publishEvent(event: WorkerEvent) {
  console.log("EVENT:", JSON.stringify(event));

  await handleEvent(event);

  try {
    await publishClient.publish(APP_EVENTS_CHANNEL, JSON.stringify(event));
  } catch (error) {
    console.warn("Error publishing message", error);
  }
}

export async function subscribeToEvents(callback: (event: string) => void) {
  events.on("event", callback);
}

export async function unsubscribeFromEvents(callback: (event: string) => void) {
  events.removeListener("event", callback);
}

export async function publishControlRequest(
  {
    system,
    group,
    version,
    plural,
  }: { system: string; group: string; version: string; plural: string },
  command: ControlCommand,
) {
  const channel = createChannelFor(system, group, version, plural);
  console.log(`publishing control message to ${channel}:`, command);
  await publishClient.xAdd(channel, "*", { message: JSON.stringify(command) });
}

function createChannelFor(
  system: string,
  group: string,
  version: string,
  plural: string,
) {
  return `${KBLOCKS_CONTROL_CHANNEL}:${group}/${version}/${plural}/${system}`;
}
