import { createClient } from "redis";
import { getEnv } from "./util";
import { EventEmitter } from "stream";
import { ControlCommand, WorkerEvent } from "@kblocks/api";
import { handleEvent } from "./storage";

const REDIS_PASSWORD = getEnv("REDIS_PASSWORD");
const REDIS_HOST = getEnv("REDIS_HOST");
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PREFIX = process.env.REDIS_PREFIX;
const APP_EVENTS_CHANNEL = (() => {
  if (REDIS_PREFIX) {
    return `${REDIS_PREFIX}app-events`;
  }
  return "app-events";
})();
const KBLOCKS_EVENTS_CHANNEL = (() => {
  if (REDIS_PREFIX) {
    return `${REDIS_PREFIX}kblocks-events`;
  }
  return "kblocks-events";
})();
const KBLOCKS_CONTROL_CHANNEL = (() => {
  if (REDIS_PREFIX) {
    return `${REDIS_PREFIX}kblocks-control`;
  }
  return "kblocks-control";
})();

const config = {
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT ? Number(REDIS_PORT) : 18284,
  },
};

const publishClient = createClient(config);
publishClient.connect().catch(console.error);

const events = new EventEmitter();

const subscribeClient = createClient(config);

subscribeClient
  .connect()
  .then(() => {
    subscribeClient.subscribe(APP_EVENTS_CHANNEL, (message) => {
      console.log("Received app message:", message);
      events.emit("event", message);
    });
    subscribeClient.subscribe(KBLOCKS_EVENTS_CHANNEL, async (message) => {
      await publishEvent(JSON.parse(message));
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
  await publishClient.publish(channel, JSON.stringify(command));
}

function createChannelFor(
  system: string,
  group: string,
  version: string,
  plural: string,
) {
  return `${KBLOCKS_CONTROL_CHANNEL}:${group}/${version}/${plural}/${system}`;
}
