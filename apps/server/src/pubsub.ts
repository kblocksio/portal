import { createClient } from 'redis';
import { getEnv } from "./util";

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
const subscribeClient = createClient(config);

publishClient.connect().catch(console.error);
subscribeClient.connect().catch(console.error);

export async function publishEvent(message: string) {
  try {
    await publishClient.publish(EVENTS_CHANNEL, message);
  } catch (error) {
    console.warn("Error publishing message", error);
  }
}

export async function subscribeToEvents(callback: (message: string) => void) {
  try {
    await subscribeClient.subscribe(EVENTS_CHANNEL, (message) => callback(message));
  } catch (error) {
    console.warn("Error subscribing to channel", error);
  }
}
