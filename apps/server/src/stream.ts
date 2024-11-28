import { publishEvent } from "./pubsub.js";
import { createRedisClient, KBLOCKS_EVENTS_CHANNEL } from "./redis.js";

const GROUP_NAME = "portal";
const CONSUMER_NAME = "consumer";

const redisClient = createRedisClient();

export function startStreamListener() {
  redisClient.connect().then(async () => {
    await createStreamGroup(KBLOCKS_EVENTS_CHANNEL);
    let isShuttingDown = false;
  
    async function listenForMessage(lastId = ">") {
      if (isShuttingDown) return;
      console.log(`Listening for messages on ${KBLOCKS_EVENTS_CHANNEL} with id: `, lastId);
      const results = await redisClient.xReadGroup(
        GROUP_NAME,
        CONSUMER_NAME,
        { key: KBLOCKS_EVENTS_CHANNEL, id: lastId },
        { COUNT: 1, BLOCK: 0, NOACK: true }
      );

      if (!results || results.length === 0) {
        setTimeout(listenForMessage, 10, lastId);
        return;
      }
  
      for (const result of results) {
        const { name, messages } = result;
        console.log(`Received ${messages.length} messages from ${name}`);
        for (const { id, message } of messages) {
          if (isShuttingDown) break;
          try {
            const event: string = Object.values(message)[0] as any;
            await publishEvent(JSON.parse(event));
          } catch (error) {
            console.error(`Error processing event: ${error}.`);
          }
        }
      }

      if (!isShuttingDown) {
        setTimeout(listenForMessage, 10, lastId);
      }
    }
  
    listenForMessage();
  })
}

async function createStreamGroup(stream: string) {
  try {
    await redisClient.xGroupCreate(stream, GROUP_NAME, "0", { MKSTREAM: true });
  } catch (error) {
    // ignore error if group already exists
  }
}

