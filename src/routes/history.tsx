import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Mail, MessageSquare, ListChecks, Search, Trash2 } from "lucide-react";
import { TopBar } from "@/components/topbar";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChats, useEmails, usePlans } from "@/lib/local-store";
import { Markdown } from "@/components/markdown";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — TrudyM AI" },
      { name: "description", content: "Locally saved emails, plans, and chats." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [emails, , removeEmail, clearEmails] = useEmails();
  const [plans, , removePlan, clearPlans] = usePlans();
  const [chats, , removeChat, clearChats] = useChats();
  const [q, setQ] = useState("");

  const filter = <T extends { [k: string]: unknown }>(arr: T[], fields: (keyof T)[]) => {
    if (!q.trim()) return arr;
    const needle = q.toLowerCase();
    return arr.filter((it) => fields.some((f) => String(it[f] ?? "").toLowerCase().includes(needle)));
  };

  const fEmails = useMemo(() => filter(emails, ["subject", "body", "purpose", "audience"]), [emails, q]);
  const fPlans = useMemo(() => filter(plans, ["goals", "plan"]), [plans, q]);
  const fChats = useMemo(() => filter(chats, ["title"]), [chats, q]);

  const clearAll = () => {
    clearEmails();
    clearPlans();
    clearChats();
    toast.success("All local history cleared");
  };

  return (
    <>
      <TopBar title="History" />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        <PageHeader
          title="History"
          description="Your locally saved items. Nothing is sent to a server."
          actions={
            <Button variant="outline" onClick={clearAll} disabled={!emails.length && !plans.length && !chats.length}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Clear all
            </Button>
          }
        />

        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search history…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
        </div>

        <Tabs defaultValue="emails">
          <TabsList>
            <TabsTrigger value="emails"><Mail className="mr-1.5 h-4 w-4" /> Emails ({emails.length})</TabsTrigger>
            <TabsTrigger value="plans"><ListChecks className="mr-1.5 h-4 w-4" /> Plans ({plans.length})</TabsTrigger>
            <TabsTrigger value="chats"><MessageSquare className="mr-1.5 h-4 w-4" /> Chats ({chats.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="emails" className="mt-4">
            {fEmails.length === 0 ? (
              <Empty label="emails" to="/email" />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {fEmails.map((e) => (
                  <Card key={e.id}>
                    <CardHeader>
                      <CardTitle className="truncate text-base">{e.subject || e.purpose}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {e.audience} · {e.tone} · {new Date(e.createdAt).toLocaleString()}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">{e.body}</p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(`Subject: ${e.subject}\n\n${e.body}`); toast.success("Copied"); }}>
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removeEmail(e.id)}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="plans" className="mt-4">
            {fPlans.length === 0 ? (
              <Empty label="plans" to="/planner" />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {fPlans.map((p) => (
                  <Card key={p.id}>
                    <CardHeader>
                      <CardTitle className="truncate text-base">{p.scope === "day" ? "Daily plan" : "Weekly plan"}</CardTitle>
                      <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm text-muted-foreground">{p.goals}</p>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(p.plan); toast.success("Copied"); }}>
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => removePlan(p.id)}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chats" className="mt-4">
            {fChats.length === 0 ? (
              <Empty label="chats" to="/chat" />
            ) : (
              <div className="grid gap-3">
                {fChats.map((c) => (
                  <Card key={c.id}>
                    <CardHeader>
                      <CardTitle className="truncate text-base">{c.title}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {c.messages.length} messages · {new Date(c.createdAt).toLocaleString()}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg bg-muted/40 p-3">
                        {c.messages.slice(0, 6).map((m, i) => (
                          <div key={i} className="text-sm">
                            <span className={m.role === "user" ? "font-medium" : "font-medium text-primary"}>
                              {m.role === "user" ? "You" : "TrudyM"}:
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {m.role === "assistant" ? <Markdown text={m.content} /> : m.content}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => removeChat(c.id)}>
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function Empty({ label, to }: { label: string; to: "/email" | "/planner" | "/chat" }) {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <p className="text-sm text-muted-foreground">No saved {label} yet.</p>
      <Button asChild size="sm" className="mt-3">
        <Link to={to}>Create your first</Link>
      </Button>
    </div>
  );
}
