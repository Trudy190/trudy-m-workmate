import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/topbar";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ResponsibleAI } from "@/components/responsible-ai";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — TrudyM AI" },
      { name: "description", content: "How to use TrudyM AI, FAQs, and privacy information." },
    ],
  }),
  component: HelpPage,
});

const faqs = [
  {
    q: "Do I need an account?",
    a: "No. TrudyM AI is privacy-first — no login, no registration, no accounts.",
  },
  {
    q: "Where is my data stored?",
    a: "Nothing is stored on a server. Items you save appear only in this browser via Local Storage.",
  },
  {
    q: "How do I clear my data?",
    a: "Open Settings → Privacy & data → Clear local history, or Clear all locally stored data.",
  },
  {
    q: "How accurate is the AI?",
    a: "AI outputs are drafts to assist you. Always review before sending or acting on them.",
  },
  {
    q: "Can I edit AI outputs?",
    a: "Yes. Every generated email or plan is fully editable, copyable, downloadable, and printable.",
  },
];

function HelpPage() {
  return (
    <>
      <TopBar title="Help & Support" />
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        <PageHeader title="Help & Support" description="Guides, FAQs, and privacy information." />

        <Card>
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
            <Step n={1} title="Pick a feature" text="Choose Email, Planner, or Chat from the sidebar." />
            <Step n={2} title="Describe your goal" text="Enter purpose, audience, tone, or your tasks." />
            <Step n={3} title="Review and use" text="Edit, copy, download, print, or save locally." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequently asked questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`q${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <ResponsibleAI feature="general" />

        <Card>
          <CardHeader>
            <CardTitle>Privacy Notice</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            TrudyM AI Workplace Productivity Assistant is designed with privacy in mind. No registration
            or login is required. The application does not use a database or permanently store user
            credentials, emails, task plans, chat conversations, or AI-generated content. Any information
            you choose to save remains only on your own device and can be deleted at any time.
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="grid h-8 w-8 place-items-center rounded-full gradient-primary text-primary-foreground text-sm font-semibold">
        {n}
      </div>
      <div className="mt-3 font-medium">{title}</div>
      <div className="text-xs text-muted-foreground">{text}</div>
    </div>
  );
}
