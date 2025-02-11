import * as kblocks from "@kblocks/api";
import { slackNotify } from "./slack-notify";
import {
  createRedisClient,
  eventsPrefix,
  objPrefix,
  timestampPrefix,
} from "./redis.js";

const client = createRedisClient();

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
    console.error("Ping failed:", error);
    await client.disconnect();
    await client.connect();
  }

  return client;
}

function keyForObject(blockUri: string) {
  return objPrefix + blockUri;
}

function keyForEvents(blockUri: string) {
  return eventsPrefix + blockUri;
}

function keyForTimestamp(blockUri: string) {
  return timestampPrefix + blockUri;
}

function keyForSlackThread(blockUri: string) {
  return `slack:${blockUri}`;
}

async function saveObject(blockUri: string, obj: kblocks.ApiObject | {}) {
  if (Object.keys(obj).length === 0) {
    await deleteEvents(blockUri);
    return deleteObject(blockUri);
  }

  const redis = await connection();
  await redis.set(keyForObject(blockUri), JSON.stringify(obj));
}

export async function getObject(
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

export async function deleteObject(blockUri: string) {
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

// export async function sliceEvents(
//   objUri: string,
//   cursor: number,
//   end: number,
// ): Promise<{
//   events: kblocks.WorkerEvent[];
//   nextCursor: number;
//   total: number;
// }> {
//   const redis = await connection();

//   const key = keyForEvents(objUri);
//   const values = await redis.lRange(key, cursor, end);
//   if (!values) {
//     return {
//       events: [],
//       nextCursor: 0,
//       total: 0,
//     };
//   }

//   const total = await redis.lLen(key);

//   return {
//     events: values.map((value) => JSON.parse(value)),
//     nextCursor: (cursor < 0 ? total + cursor : cursor) + values.length,
//     total,
//   };
// }
export async function sliceEvents(
  objUri: string,
  start: number,
  end: number,
): Promise<kblocks.WorkerEvent[]> {
  const redis = await connection();

  const key = keyForEvents(objUri);
  const events = await redis.lRange(key, start, end);
  return events.map((value) => JSON.parse(value));
}

export async function eventsCount(objUri: string): Promise<number> {
  const redis = await connection();

  const key = keyForEvents(objUri);
  return await redis.lLen(key);
}

export async function deleteEvents(objUri: string) {
  const redis = await connection();

  const key = keyForEvents(objUri);
  await redis.del(key);
}

async function updateTimestampIfSmaller(key: string, newTimestamp: number) {
  const redis = await connection();
  const script = `
    local key = KEYS[1]
    local newTimestamp = tonumber(ARGV[1])

    if redis.call('EXISTS', key) == 1 then
        local currentTimestamp = tonumber(redis.call('GET', key))
        if currentTimestamp < newTimestamp then
            redis.call('SET', key, newTimestamp)
            return 1
        end
    else
        redis.call('SET', key, newTimestamp)
        return 1
    end
    return 0
  `;

  const result = await redis.eval(script, {
    keys: [key],
    arguments: [newTimestamp.toString()],
  });
  return result === 1;
}

export async function getSlackThread(
  requestId: string,
): Promise<string | undefined> {
  const redis = await connection();
  const key = keyForSlackThread(requestId);
  const value = await redis.get(key);
  if (!value) {
    return undefined;
  }
  return value;
}

export async function setSlackThread(requestId: string, thread: string) {
  const redis = await connection();
  const key = keyForSlackThread(requestId);
  await redis.set(key, thread);
}

async function storeEvent(event: kblocks.WorkerEvent) {
  if (event.type === "OBJECT") {
    return saveObject(event.objUri, event.object as kblocks.ApiObject);
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
