import { createClient } from "redis";
import { getEnv } from "./util";

const KBLOCKS_API_KEY = getEnv("KBLOCKS_API_KEY");
const KBLOCKS_PUBSUB_HOST = getEnv("KBLOCKS_PUBSUB_HOST");
const KBLOCKS_PUBSUB_PORT = process.env.KBLOCKS_PUBSUB_PORT;
const KBLOCKS_STORAGE_PREFIX = process.env.KBLOCKS_STORAGE_PREFIX;
export const APP_EVENTS_CHANNEL = (() => {
  if (KBLOCKS_STORAGE_PREFIX) {
    return `${KBLOCKS_STORAGE_PREFIX}app-events`;
  }
  return "app-events";
})();
export const KBLOCKS_EVENTS_CHANNEL = (() => {
  if (KBLOCKS_STORAGE_PREFIX) {
    return `${KBLOCKS_STORAGE_PREFIX}kblocks-events`;
  }
  return "kblocks-events";
})();
export const KBLOCKS_CONTROL_CHANNEL = (() => {
  if (KBLOCKS_STORAGE_PREFIX) {
    return `${KBLOCKS_STORAGE_PREFIX}kblocks-control`;
  }
  return "kblocks-control";
})();
export const objPrefix = (() => {
  if (KBLOCKS_STORAGE_PREFIX) {
    return `${KBLOCKS_STORAGE_PREFIX}:obj:`;
  }
  return "obj:";
})();
export const eventsPrefix = (() => {
  if (KBLOCKS_STORAGE_PREFIX) {
    return `${KBLOCKS_STORAGE_PREFIX}:logs:`;
  }
  return "logs:";
})();
export const timestampPrefix = (() => {
  if (KBLOCKS_STORAGE_PREFIX) {
    return `${KBLOCKS_STORAGE_PREFIX}:ts:`;
  }
  return "ts:";
})();

const config = {
  password: KBLOCKS_API_KEY,
  socket: {
    host: KBLOCKS_PUBSUB_HOST,
    port: KBLOCKS_PUBSUB_PORT ? Number(KBLOCKS_PUBSUB_PORT) : 18284,
  },
};

export const createRedisClient = () => createClient(config)
