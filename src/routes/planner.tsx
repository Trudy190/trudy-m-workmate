import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Loader2, Printer, RotateCcw, Save, Sparkles, Trash2 } from "lucide-react";
import { TopBar } from "@/components/topbar";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAI } from "@/components/responsible-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generatePlan } from "@/lib/ai.functions";
import { newId, usePlans, useSessionStats } from "@/lib/local-store";
import { Markdown } from "@/components/markdown";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — TrudyM AI" },
      { name: "description", content: "Generate realistic daily and weekly work plans." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const gen = useServerFn(generatePlan);
  const [, addPlan] = usePlans();
  const [stats, setStats] = useSessionStats();
  const [goals, setGoals] = useState("");
  const [scope, setScope] = useState<"day" | "week">("day");
  const [hours, setHours] = useState("09:00 – 17:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("");
  const [editMode, setEditMode] = useState(false);

  const run = async () => {
    if (!goals.trim()) {
      toast.error("Please enter your goals or tasks.");
      return;
    }
    setLoading(true);
    try {
      const r = await gen({ data: { goals, scope, workingHours: hours, notes } });
      setPlan(r.plan);
      setStats({ plansCreated: stats.plansCreated + 1 });
      toast.success("Plan generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(plan);
    toast.success("Copied");
  };
  const download = () => {
    const blob = new Blob([plan], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plan-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const print = () => window.print();
  const save = () => {
    if (!plan) return;
    addPlan({ id: newId(), createdAt: Date.now(), scope, goals, plan });
    toast.success("Saved locally");
  };

  return (
    <>
      <TopBar title="AI Task Planner" />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        <PageHeader
          title="AI Task Planner"
          description="Turn goals into a structured, realistic work plan with priorities and time estimates."
        />
        <ResponsibleAI feature="planner" />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Plan setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Scope</Label>
                <Tabs value={scope} onValueChange={(v) => setScope(v as "day" | "week")} className="mt-1">
                  <TabsList>
                    <TabsTrigger value="day">Daily</TabsTrigger>
                    <TabsTrigger value="week">Weekly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <Label htmlFor="goals">Goals / tasks</Label>
                <Textarea
                  id="goals"
                  placeholder="List the outcomes you want to achieve, tasks, and any deadlines…"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="mt-1 min-h-40"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="hours">Working hours</Label>
                  <Input id="hours" value={hours} onChange={(e) => setHours(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Constraints, energy levels…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={run} disabled={loading}>
                  {loading ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Planning…</>
                  ) : (
                    <><Sparkles className="mr-1.5 h-4 w-4" /> Generate plan</>
                  )}
                </Button>
                {plan && (
                  <Button variant="outline" onClick={run} disabled={loading}>
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Regenerate
                  </Button>
                )}
                <Button variant="ghost" onClick={() => { setPlan(""); setGoals(""); setNotes(""); }}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardTitle>Your plan</CardTitle>
              {plan && (
                <Button size="sm" variant="ghost" onClick={() => setEditMode((v) => !v)}>
                  {editMode ? "Preview" : "Edit"}
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : plan ? (
                <>
                  {editMode ? (
                    <Textarea
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="min-h-[420px] font-mono text-sm"
                    />
                  ) : (
                    <div className="rounded-xl border bg-muted/30 p-4 print:border-0 print:bg-transparent">
                      <Markdown text={plan} />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 print:hidden">
                    <Button variant="outline" onClick={copy}><Copy className="mr-1.5 h-4 w-4" /> Copy</Button>
                    <Button variant="outline" onClick={download}><Download className="mr-1.5 h-4 w-4" /> Download</Button>
                    <Button variant="outline" onClick={print}><Printer className="mr-1.5 h-4 w-4" /> Print</Button>
                    <Button variant="outline" onClick={save}><Save className="mr-1.5 h-4 w-4" /> Save locally</Button>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                  Your structured plan will appear here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
