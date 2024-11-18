import { createClient } from "redis";
import { getEnv } from "./util";
import { EventEmitter } from "stream";
import { ControlCommand, WorkerEvent } from "@kblocks/api";
import { handleEvent } from "./storage";

const REDIS_PASSWORD = getEnv("REDIS_PASSWORD");
// const REDIS_HOST = getEnv("REDIS_HOST");
const REDIS_PREFIX = process.env.REDIS_PREFIX;
const EVENTS_CHANNEL = (() => {
  if (REDIS_PREFIX) {
    return `${REDIS_PREFIX}:events`;
  }
  return "events";
})();

const publishClient = createClient({
  url: process.env.REDIS_URL,
  password: REDIS_PASSWORD,
});
publishClient.connect().catch(console.error);

const events = new EventEmitter();

const subscribeClient = publishClient.duplicate();

subscribeClient
  .connect()
  .then(() => {
    subscribeClient.subscribe(EVENTS_CHANNEL, (message) => {
      console.log("Received message:", message);
      events.emit("event", message);
    });
  })
  .catch(console.error);

export async function publishEvent(event: WorkerEvent) {
  console.log("EVENT:", JSON.stringify(event));

  await handleEvent(event);

  try {
    await publishClient.publish(EVENTS_CHANNEL, JSON.stringify(event));
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

export async function subscribeToControlRequests(
  {
    system,
    group,
    version,
    plural,
  }: { system: string; group: string; version: string; plural: string },
  callback: (event: string) => void,
) {
  const channel = createChannelFor(system, group, version, plural);
  await subscribeClient.subscribe(channel, callback);

  return {
    unsubscribe: () => {
      console.log(`unsubscribing from ${channel}`);
      subscribeClient.unsubscribe(channel);
    },
  };
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
  return `create:${system}/${group}/${version}/${plural}`;
}
