import { createClient } from 'redis';
import { getEnv } from "./util";
import { EventEmitter } from 'stream';

const REDIS_PASSWORD = getEnv("REDIS_PASSWORD");
const REDIS_HOST = getEnv("REDIS_HOST");
const EVENTS_CHANNEL = "events";

const config = {
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: 18284
  }
};

const publishClient = createClient(config);
publishClient.connect().catch(console.error);

const events = new EventEmitter();

const subscribeClient = createClient(config);

subscribeClient.connect()
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

export function subscribeToControlRequests({ systemId, group, version, plural }: { systemId: string, group: string, version: string, plural: string }, callback: (event: string) => void) {
  const channel = createChannelFor(systemId, group, version, plural);
  subscribeClient.subscribe(channel, callback);

  return {
    unsubscribe: () => {
      console.log(`unsubscribing from ${channel}`);
      subscribeClient.unsubscribe(channel);
    }
  }
}

export function publishControlRequest({ systemId, group, version, plural }: { systemId: string, group: string, version: string, plural: string }, message: string) {
  const channel = createChannelFor(systemId, group, version, plural);
  console.log(`publishing control message to ${channel}:`, message);
  publishClient.publish(channel, message);
}

function createChannelFor(systemId: string, group: string, version: string, plural: string) {
  return `create:${systemId}/${group}/${version}/${plural}`;
}