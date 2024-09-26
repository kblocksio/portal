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

export async function subscribeToControlRequests(systemId: string, resourceType: string, callback: (event: string) => void) {
  subscribeClient.subscribe(`control.${systemId}.${resourceType}`, callback);
}

export async function publishControlRequest(systemId: string, resourceType: string, message: string) {
  await publishClient.publish(`control.${systemId}.${resourceType}`, message);
}
