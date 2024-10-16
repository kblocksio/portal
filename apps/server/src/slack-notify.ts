import { EventReason, parseBlockUri, WorkerEvent } from "@kblocks/api";
import { getSlackThread, setSlackThread } from "./storage";
import { Blocks, sendSlackMessage } from "./slack-util";

export async function slackNotify(event: WorkerEvent) {
  const slackChannel = process.env.SLACK_CHANNEL ?? "kblocks-notifications";
  const message = formatMessage(event);
  if (!message) {
    return;
  }

  const thread = await getSlackThread(event.objUri);

  const ctx = await sendSlackMessage(slackChannel, message, thread);
  if (ctx.ts) {
    await setSlackThread(event.objUri, ctx.ts);
  }
}

function formatMessage(event: WorkerEvent): Blocks | undefined {
  const objUri = parseBlockUri(event.objUri);
  const prefix = `*${objUri.plural}* *${objUri.namespace}/${objUri.name}*`;

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

      return [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${icon()} ${prefix} - ${event.event.message}`,
          },
        },
      ];

    case "ERROR":
      if (event.explanation?.blocks) {
        return event.explanation?.blocks;
      } else {
        return [
          {
            type: "section",
            text: { type: "mrkdwn", text: `❌ ${prefix} - ${event.message}` },
          },
        ];
      }

    default:
      return undefined;
  }
}
