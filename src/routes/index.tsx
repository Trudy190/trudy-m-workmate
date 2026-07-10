import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  ListChecks,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Zap,
  Clock,
  Brain,
} from "lucide-react";
import { TopBar } from "@/components/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSessionStats, useEmails, usePlans, useChats } from "@/lib/local-store";
import hero from "@/assets/dashboard-hero.jpg";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const features = [
  {
    title: "Smart Email Generator",
    description: "Draft professional emails with audience, tone, and length controls.",
    icon: Mail,
    href: "/email",
  },
  {
    title: "AI Task Planner",
    description: "Generate realistic daily and weekly plans with priorities and time estimates.",
    icon: ListChecks,
    href: "/planner",
  },
  {
    title: "TrudyM Chat Assistant",
    description: "Ask, brainstorm, summarise, and rewrite — a workplace assistant at your side.",
    icon: MessageSquare,
    href: "/chat",
  },
];

const tips = [
  { icon: Zap, text: "Batch similar tasks together to reduce context switching." },
  { icon: Clock, text: "Time-box focused work into 45–90 minute deep-work blocks." },
  { icon: Brain, text: "Ask TrudyM to summarise long documents before your meetings." },
];

function Dashboard() {
  const [stats] = useSessionStats();
  const [emails] = useEmails();
  const [plans] = usePlans();
  const [chats] = useChats();

  const recent = [
    ...emails.slice(0, 2).map((e) => ({ id: e.id, kind: "Email", title: e.subject || e.purpose, href: "/history" as const })),
    ...plans.slice(0, 2).map((p) => ({ id: p.id, kind: "Plan", title: p.goals.slice(0, 60), href: "/history" as const })),
    ...chats.slice(0, 2).map((c) => ({ id: c.id, kind: "Chat", title: c.title, href: "/history" as const })),
  ].slice(0, 5);

  return (
    <>
      <TopBar title="Dashboard" />
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:py-10">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border bg-card shadow-[var(--shadow-soft)]">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:p-10">
            <div className="min-w-0 space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Welcome to TrudyM AI
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Your AI workplace <span className="bg-clip-text text-transparent gradient-primary">productivity assistant</span>
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                Draft professional emails, plan your day, and chat with TrudyM — all in one clean,
                privacy-first workspace. No signup, no database, your data stays on your device.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="lg">
                  <Link to="/email">
                    Start with an email <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/chat">Chat with TrudyM</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <img
                src={hero}
                alt="Modern workspace illustration"
                width={1280}
                height={720}
                className="h-auto w-full rounded-2xl border shadow-[var(--shadow-elegant)]"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Emails generated" value={stats.emailsGenerated} icon={Mail} />
          <StatCard label="Task plans created" value={stats.plansCreated} icon={ListChecks} />
          <StatCard label="AI chats completed" value={stats.chatsCompleted} icon={MessageSquare} />
        </section>

        {/* Features */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-lg font-semibold">Explore features</h2>
            <p className="text-xs text-muted-foreground">Pick a tool to get started</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((f) => (
              <Link key={f.href} to={f.href} className="group">
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
                  <CardHeader>
                    <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-3">{f.title}</CardTitle>
                    <CardDescription>{f.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Jump straight into a common workflow.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              <QuickAction to="/email" icon={Mail} label="Draft a follow-up email" />
              <QuickAction to="/planner" icon={ListChecks} label="Plan my week" />
              <QuickAction to="/chat" icon={MessageSquare} label="Summarise a meeting" />
              <QuickAction to="/chat" icon={Sparkles} label="Rewrite for clarity" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productivity tips</CardTitle>
              <CardDescription>Small habits, real impact.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tips.map((t, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-muted/60 p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-background text-primary">
                    <t.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm">{t.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Items saved locally in this browser.</CardDescription>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Nothing here yet. Generate an email or plan to see it appear.
                </div>
              ) : (
                <ul className="divide-y">
                  {recent.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-primary">{r.kind}</div>
                        <div className="truncate text-sm">{r.title || "Untitled"}</div>
                      </div>
                      <Button asChild size="sm" variant="ghost">
                        <Link to={r.href}>View</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <div className="text-xs text-muted-foreground">{label} · current session</div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: "/email" | "/planner" | "/chat";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-accent/50"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 truncate text-sm font-medium">{label}</div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
