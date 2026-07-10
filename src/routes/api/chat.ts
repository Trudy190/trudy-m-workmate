import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGateway, DEFAULT_MODEL } from "@/lib/ai-gateway.server";
import { CHAT_SYSTEM } from "@/lib/system-prompts";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGateway(key);
        const modelMessages = await convertToModelMessages(messages);
        const result = streamText({
          model: gateway(DEFAULT_MODEL),
          system: CHAT_SYSTEM,
          messages: modelMessages,
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
