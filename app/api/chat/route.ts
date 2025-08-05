import { groq } from "@ai-sdk/groq";
import { openrouter } from "@openrouter/ai-sdk-provider";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
} from "ai";
import { NextRequest } from "next/server";

export type MessageMetadata = {
  isAborted?: boolean;
  error?: string;
};

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage<MessageMetadata>[] } =
    await req.json();

  const result = streamText({
    //model: groq("moonshotai/kimi-k2-instruct"),
    model: openrouter.chat("openai/gpt-4.1-nano"),
    abortSignal: req.signal,
    messages: convertToModelMessages(messages),
    onChunk: ({ chunk }) => {
      // Just to test the error handling
      if (chunk.type === "text-delta") {
        if (chunk.text.toLowerCase().includes("err")) {
          throw new Error("Test error");
        }
      }
    },
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }): MessageMetadata | undefined => {
      if (part.type === "abort") {
        return {
          isAborted: true,
        };
      }

      if (part.type === "error") {
        return {
          error: "error from metadata",
        };
      }
    },
  });
}
