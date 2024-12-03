import openai from "openai";
import type { Blocks } from "./slack-util";
import { EventReason } from "@kblocks/api";
import { publishEvent } from "./pubsub";
import { WorkerEvent } from "@kblocks/api";

const prompt = "Provide the root cause of this error with concise instructions on how to fix. Output format should be JSON of Slack blocks with 'mrkdwn' sections. Do not wrap this in triple backticks, just output raw well-formatted JSON.";

export async function analyzeErrorWithAI(event: WorkerEvent) {
  if (event.type === "LIFECYCLE" && event.event.reason === EventReason.Failed) {
    console.log("Analyzing error event with AI...");
    const explanation = await explainError(event);
    console.log("Explanation:", explanation);

    await publishEvent({
      type: "ERROR",
      objUri: event.objUri,
      requestId: event.requestId,
      objType: event.objType,
      timestamp: new Date(),
      message: event.event.message,
      explanation,
    });
  }
}

async function chatCompletion(input: openai.ChatCompletionCreateParamsNonStreaming): Promise<string | undefined> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Skipping AI analysis because OPENAI_API_KEY is not set");
    return undefined;
  }

  const client = new openai.OpenAI({ apiKey });

  const response = await client.chat.completions.create(input);
  return response.choices?.[0]?.message?.content ?? undefined;
}

/**
 * Explains an error message and provides instructions on how to fix it.
 * @returns A slack "blocks" JSON object that explains the error and provides instructions on how to fix it.
 */
async function explainError(context: any): Promise<{ blocks: Blocks } | undefined> {
  console.error("Analyzing error with AI...");

  try {
    const content = await chatCompletion({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: JSON.stringify({ context }) },
      ],
    })

    if (!content) {
      console.error("WARNING: Did not receive a response from the AI");
      return undefined;
    }

    return JSON.parse(content);
  } catch (e) {
    console.error("WARNING: Could not analyze error with AI:", e);
    return undefined;
  }
}
