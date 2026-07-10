import { Info } from "lucide-react";

const messages: Record<string, string> = {
  general:
    "AI-generated content is intended to assist users and may occasionally contain inaccuracies. Always review, verify, and edit AI-generated content before using it in professional or business environments.",
  email:
    "AI-generated emails assist with drafting professional communication. Always review, edit, and verify the content for accuracy, tone, and appropriateness before sending.",
  planner:
    "AI-generated schedules and recommendations are productivity suggestions. Review and adjust priorities, deadlines, and time estimates to suit your workload.",
  chat: "TrudyM AI provides workplace assistance based on your prompts. Responses may not always be complete or accurate. Verify important information and avoid sharing confidential, personal, or sensitive business information.",
};

export function ResponsibleAI({ feature = "general" }: { feature?: keyof typeof messages | string }) {
  const text = messages[feature] ?? messages.general;
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border/70 bg-accent/40 p-3 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p>
        <span className="font-medium text-foreground">Responsible AI Notice:</span> {text}
      </p>
    </div>
  );
}
