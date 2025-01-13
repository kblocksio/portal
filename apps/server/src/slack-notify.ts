import { EventReason, parseBlockUri, WorkerEvent } from "@kblocks/api";
import { getSlackThread, setSlackThread } from "./storage";
import { Blocks, sendSlackMessage } from "./slack-util";

export async function slackNotify(event: WorkerEvent) {
  const slackChannel = process.env.SLACK_CHANNEL ?? "kblocks-notifications";
  const message = formatMessage(event);
  if (!message) {
    return;
  }

  const thread = await getSlackThread(event.requestId);

  console.log(
    `Sending slack message ${JSON.stringify(message)} to ${slackChannel} with thread ${thread}`,
  );

  const ctx = await sendSlackMessage(slackChannel, message, thread);
  if (ctx.ts) {
    await setSlackThread(event.objUri, ctx.ts);
  }
}

function formatMessage(event: WorkerEvent): Blocks | undefined {
  if (event.type !== "LIFECYCLE" && event.type !== "ERROR") {
    return undefined;
  }

  const objUri = parseBlockUri(event.objUri);

  let blocks: any[] = [
    {
      type: "section",
      text: {
        type: "plain_text",
        text: "An event occurred in your cluster.",
      },
    },
  ];

  switch (event.type) {
    case "LIFECYCLE":
      const icon = () => {
        switch (event.event.reason) {
          case EventReason.Started:
            return "🚀";
          case EventReason.Succeeded:
            return "✅";
          case EventReason.Failed:
            return "❌";
          case EventReason.Resolving:
            return "🔍";
          case EventReason.Resolved:
            return "🎉";
          default:
            return "ℹ️";
        }
      };

      blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: `${icon()} ${event.event.message}`,
        },
      });
      break;

    case "ERROR":
      blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: `❌ ${event.message}`,
        },
      });
      break;
  }

  const url = `${process.env.WEBSITE_ORIGIN}/resources/${objUri.plural}/${objUri.namespace}/${objUri.name}#details`;

  blocks.push({
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Name:*\n<${url}|${objUri.name}>`,
      },
      {
        type: "mrkdwn",
        text: `*Namespace:*\n${objUri.namespace}`,
      },
      {
        type: "mrkdwn",
        text: `*Type:*\n\`${event.objType}\``,
      },
    ],
  });

  if (event.type === "ERROR" && event.explanation?.blocks) {
    blocks.push(...event.explanation.blocks);
  }

  // blocks.push({
  //   type: "section",
  //   text: {
  //     type: "mrkdwn",
  //     text: `\`\`\`\n${JSON.stringify(event, null, 2)}\n\`\`\``,
  //   },
  // });

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `<${url}|View in Kblocks Portal>`,
    },
  });

  return blocks;
}
