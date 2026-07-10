import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGateway, DEFAULT_MODEL } from "./ai-gateway.server";
import { EMAIL_SYSTEM, PLANNER_SYSTEM } from "./system-prompts";

const EmailInput = z.object({
  purpose: z.string().min(3),
  audience: z.string().min(1),
  tone: z.string().min(1),
  length: z.enum(["short", "medium", "detailed"]),
  extraContext: z.string().optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGateway(key);

    const userPrompt = `Draft a workplace email.
Purpose: ${data.purpose}
Audience: ${data.audience}
Tone: ${data.tone}
Length: ${data.length}
${data.extraContext ? `Extra context: ${data.extraContext}` : ""}

Return JSON: {"subject": "...", "body": "..."}`;

    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: EMAIL_SYSTEM,
      prompt: userPrompt,
    });

    // Parse JSON tolerantly
    let subject = "";
    let body = "";
    try {
      const cleaned = text.replace(/```json|```/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : cleaned);
      subject = String(parsed.subject ?? "");
      body = String(parsed.body ?? "");
    } catch {
      body = text;
      subject = data.purpose.slice(0, 80);
    }
    return { subject, body };
  });

const PlannerInput = z.object({
  goals: z.string().min(3),
  scope: z.enum(["day", "week"]),
  workingHours: z.string().optional(),
  notes: z.string().optional(),
});

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerInput.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGateway(key);

    const prompt = `Create a structured ${data.scope === "day" ? "daily" : "weekly"} work plan.
Goals / tasks:
${data.goals}
${data.workingHours ? `Working hours: ${data.workingHours}` : ""}
${data.notes ? `Notes: ${data.notes}` : ""}`;

    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: PLANNER_SYSTEM,
      prompt,
    });
    return { plan: text };
  });
