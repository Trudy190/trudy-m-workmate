import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, RotateCcw, Sparkles, Trash2, Loader2, Save } from "lucide-react";
import { TopBar } from "@/components/topbar";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAI } from "@/components/responsible-ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { generateEmail } from "@/lib/ai.functions";
import { useEmails, useSessionStats, newId } from "@/lib/local-store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — TrudyM AI" },
      {
        name: "description",
        content: "Draft professional workplace emails with audience and tone controls.",
      },
    ],
  }),
  component: EmailPage,
});

const audiences = ["Client", "Manager", "Team Member", "Human Resources", "Supplier", "General Business Contact"];
const tones = ["Formal", "Friendly", "Informal", "Professional", "Persuasive", "Follow-up", "Apologetic"];

function EmailPage() {
  const gen = useServerFn(generateEmail);
  const [, addEmail] = useEmails();
  const [, setStats] = useSessionStats();

  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("Client");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState<"short" | "medium" | "detailed">("medium");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const run = async () => {
    if (!purpose.trim()) {
      toast.error("Please enter the purpose of the email.");
      return;
    }
    setLoading(true);
    try {
      const result = await gen({
        data: { purpose, audience, tone, length, extraContext: extra || undefined },
      });
      setSubject(result.subject);
      setBody(result.body);
      setStats((s => ({ emailsGenerated: (s?.emailsGenerated ?? 0) + 1 }))(undefined as never) as never);
      toast.success("Email drafted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPurpose("");
    setExtra("");
    setSubject("");
    setBody("");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([`Subject: ${subject}\n\n${body}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const save = () => {
    if (!body) return;
    addEmail({
      id: newId(),
      createdAt: Date.now(),
      purpose,
      audience,
      tone,
      length,
      subject,
      body,
    });
    toast.success("Saved locally");
  };

  return (
    <>
      <TopBar title="Smart Email Generator" />
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        <PageHeader
          title="Smart Email Generator"
          description="Generate professional workplace emails tailored to your audience and tone."
        />
        <ResponsibleAI feature="email" />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Compose
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea
                  id="purpose"
                  placeholder="e.g. Follow up with client on Q3 proposal and confirm next meeting"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="mt-1 min-h-24"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label>Audience</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {audiences.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Length</Label>
                  <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="extra">Extra context (optional)</Label>
                <Textarea
                  id="extra"
                  placeholder="Any specifics to include — dates, names, key points…"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  className="mt-1 min-h-20"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={run} disabled={loading}>
                  {loading ? (
                    <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Generating…</>
                  ) : (
                    <><Sparkles className="mr-1.5 h-4 w-4" /> Generate email</>
                  )}
                </Button>
                {(subject || body) && (
                  <Button variant="outline" onClick={run} disabled={loading}>
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Regenerate
                  </Button>
                )}
                <Button variant="ghost" onClick={clear}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : subject || body ? (
                <>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="body">Body (editable)</Label>
                    <Textarea
                      id="body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="mt-1 min-h-80 font-[15px] leading-relaxed"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={copy}>
                      <Copy className="mr-1.5 h-4 w-4" /> Copy
                    </Button>
                    <Button variant="outline" onClick={download}>
                      <Download className="mr-1.5 h-4 w-4" /> Download
                    </Button>
                    <Button variant="outline" onClick={save}>
                      <Save className="mr-1.5 h-4 w-4" /> Save locally
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                  Your generated email will appear here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
