import { createClient } from "redis";
import { getEnv } from "./util";

const REDIS_PASSWORD = getEnv("REDIS_PASSWORD");
const REDIS_HOST = getEnv("REDIS_HOST");
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PREFIX = process.env.REDIS_PREFIX;
export const APP_EVENTS_CHANNEL = (() => {
  if (REDIS_PREFIX) {
    return `${REDIS_PREFIX}app-events`;
  }
  return "app-events";
})();
export const KBLOCKS_EVENTS_CHANNEL = (() => {
  if (REDIS_PREFIX) {
    return `${REDIS_PREFIX}kblocks-events`;
  }
  return "kblocks-events";
})();
export const KBLOCKS_CONTROL_CHANNEL = (() => {
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

export const createRedisClient = () => createClient(config)
