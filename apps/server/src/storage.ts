import * as kblocks from "@kblocks/api";
import { createClient } from "redis";
import { getEnv } from "./util";
import { slackNotify } from "./slack-notify";

const REDIS_PASSWORD = getEnv("REDIS_PASSWORD");
const REDIS_HOST = getEnv("REDIS_HOST");
const objPrefix = "obj:";

const config = {
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: 18284,
  },
};

const client = createClient(config);

client.connect().catch((e) => {
  console.error(`Error connecting to Redis: ${e.message}`);
});

async function connection() {
  if (!client.isOpen) {
    await client.connect();
  }
  try {
    await client.ping();
  } catch (error) {
    console.error("Redis connection lost. Reconnecting...");
    await client.connect();
  }

  return client;
}

function keyForObject(blockUri: string) {
  return objPrefix + blockUri;
}

function keyForEvents(blockUri: string) {
  return `logs:${blockUri}`;
}

function keyForSlackThread(blockUri: string) {
  return `slack:${blockUri}`;
}

async function saveObject(blockUri: string, obj: kblocks.ApiObject | {}) {
  if (Object.keys(obj).length === 0) {
    return deleteObject(blockUri);
  }

  const redis = await connection();
  await redis.set(keyForObject(blockUri), JSON.stringify(obj));
}

export async function loadObject(
  blockUri: string,
): Promise<kblocks.ApiObject | null> {
  const redis = await connection();
  const value = await redis.get(keyForObject(blockUri));
  if (!value) {
    return null;
  }
  return JSON.parse(value);
}

async function listAllObjects() {
  const redis = await connection();
  return (await redis.keys(objPrefix + "*"))
    .map((key) => key.slice(objPrefix.length))
    .filter((key) => {
      try {
        kblocks.parseBlockUri(key);
        return true;
      } catch (e) {
        return false;
      }
    });
}

export async function resetStorage() {
  const redis = await connection();
  await redis.flushDb();
}

async function deleteObject(blockUri: string) {
  const redis = await connection();
  await redis.del(keyForObject(blockUri));
}

export async function getAllObjects() {
  const keys = await listAllObjects();
  if (keys.length === 0) {
    return {};
  }

  const redis = await connection();
  const values = await redis.mGet(keys.map((key) => keyForObject(key)));

  const result: Record<string, kblocks.ApiObject> = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = values[i];
    if (!value) {
      continue;
    }
    const obj = JSON.parse(value);
    result[key] = obj;
  }

  return result;
}

async function store(objUri: string, log: kblocks.WorkerEvent) {
  const redis = await connection();

  const key = keyForEvents(objUri);
  await redis.rPush(key, JSON.stringify(log));
}

export async function loadEvents(
  objUri: string,
): Promise<kblocks.WorkerEvent[]> {
  const redis = await connection();

  const key = keyForEvents(objUri);
  const values = await redis.lRange(key, 0, -1);
  if (!values) {
    return [];
  }

  return values.map((value) => JSON.parse(value));
}

export async function getSlackThread(
  objUri: string,
): Promise<string | undefined> {
  const redis = await connection();
  const key = keyForSlackThread(objUri);
  const value = await redis.get(key);
  if (!value) {
    return undefined;
  }
  return value;
}

export async function setSlackThread(objUri: string, thread: string) {
  const redis = await connection();
  const key = keyForSlackThread(objUri);
  await redis.set(key, thread);
}

async function patchObject(objUri: string, patch: kblocks.ApiObject) {
  const obj = await loadObject(objUri);
  if (!obj) {
    console.warn(`Object not found: ${objUri}`);
    return;
  }

  const newObj = { ...obj, ...patch };
  return saveObject(objUri, newObj);
}

async function storeEvent(event: kblocks.WorkerEvent) {
  if (event.type === "OBJECT") {
    return saveObject(event.objUri, event.object as kblocks.ApiObject);
  }

  if (event.type === "PATCH") {
    return patchObject(event.objUri, event.patch);
  }

  // store all other events
  return store(event.objUri, event);
}

export async function handleEvent(event: kblocks.WorkerEvent) {
  try {
    await storeEvent(event);
  } catch (e) {
    console.error(`Error storing event: ${JSON.stringify(event)}: ${e}`);
  }

  try {
    await slackNotify(event);
  } catch (e) {
    console.error(`Error sending slack notification: ${e}`);
  }
}
