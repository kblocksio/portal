import { createClient } from 'redis';
import { getEnv } from "./util";

const REDIS_PASSWORD = getEnv("REDIS_PASSWORD");
const REDIS_HOST = getEnv("REDIS_HOST");

const redisClient = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: 18284
  }
});

const CHANNEL = "events";

redisClient.connect().catch(console.error);

export async function publish(message: string) {
  try {
    await redisClient.publish(CHANNEL, message);
  } catch (error) {
    console.warn("Error publishing message", error);
  }
}

export async function subscribe(callback: (message: string) => void) {
  try {
    await redisClient.subscribe(CHANNEL, (message) => callback(message));
  } catch (error) {
    console.warn("Error subscribing to channel", error);
  }
}
