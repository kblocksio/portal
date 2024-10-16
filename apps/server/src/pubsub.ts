import { createClient } from "redis";
import { getEnv } from "./util";
import { EventEmitter } from "stream";
import { ControlCommand } from "@kblocks/api";

const REDIS_PASSWORD = getEnv("REDIS_PASSWORD");
const REDIS_HOST = getEnv("REDIS_HOST");
const EVENTS_CHANNEL = "events";

const config = {
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: 18284,
  },
};

const publishClient = createClient(config);
publishClient.connect().catch(console.error);

const events = new EventEmitter();

const subscribeClient = createClient(config);

subscribeClient
  .connect()
  .then(() => {
    subscribeClient.subscribe(EVENTS_CHANNEL, (message) => {
      console.log("Received message:", message);
      events.emit("event", message);
    });
  })
  .catch(console.error);

export async function publishEvent(message: string) {
  try {
    await publishClient.publish(EVENTS_CHANNEL, message);
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

export function subscribeToControlRequests(
  {
    system,
    group,
    version,
    plural,
  }: { system: string; group: string; version: string; plural: string },
  callback: (event: string) => void,
) {
  const channel = createChannelFor(system, group, version, plural);
  subscribeClient.subscribe(channel, callback);

  return {
    unsubscribe: () => {
      console.log(`unsubscribing from ${channel}`);
      subscribeClient.unsubscribe(channel);
    },
  };
}

export function publishControlRequest(
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
  publishClient.publish(channel, JSON.stringify(command));
}

function createChannelFor(
  system: string,
  group: string,
  version: string,
  plural: string,
) {
  return `create:${system}/${group}/${version}/${plural}`;
}
