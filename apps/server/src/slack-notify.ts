import { parseBlockUri, WorkerEvent } from "@kblocks/api";
import { getSlackThread, setSlackThread } from "./storage";
import { Blocks, sendSlackMessage } from "./slack-util";

export async function slackNotify(event: WorkerEvent) {
  // ignore non-lifecycle events
  if (event.type !== "LIFECYCLE") {
    return;
  }

  const objUri = parseBlockUri(event.objUri);
  const slackChannel = process.env.SLACK_CHANNEL ?? "kblocks-notifications";
  
  const thread = await getSlackThread(event.objUri);
  const message: Blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${objUri.plural}* *${objUri.namespace}/${objUri.name}* - ${event.event.message}`,
      },
    },
  ];
  
  const ctx = await sendSlackMessage(slackChannel, message, thread);
  if (ctx.ts) {
    await setSlackThread(event.objUri, ctx.ts);
  }
}