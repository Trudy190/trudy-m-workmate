import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Send, Trash2, User } from "lucide-react";
import { TopBar } from "@/components/topbar";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAI } from "@/components/responsible-ai";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/markdown";
import { newId, useChats, useSessionStats } from "@/lib/local-store";
import logo from "@/assets/trudym-logo.png";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "TrudyM Chat Assistant — TrudyM AI" },
      { name: "description", content: "Chat with TrudyM, your workplace AI assistant." },
    ],
  }),
  component: ChatPage,
});

type Msg = { id: string; role: "user" | "assistant"; content: string };

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted" | "streaming">("idle");
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [, addChat] = useChats();
  const [, setStats] = useSessionStats();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const send = async () => {
    const text = input.trim();
    if (!text || status !== "idle") return;
    const userMsg: Msg = { id: newId(), role: "user", content: text };
    const assistantMsg: Msg = { id: newId(), role: "assistant", content: "" };
    const next = [...messages, userMsg];
    setMessages([...next, assistantMsg]);
    setInput("");
    setStatus("submitted");

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      // Send as AI SDK UIMessage shape (with parts)
      const uiMessages = next.map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text", text: m.content }],
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: uiMessages }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Request failed (${res.status})`);
      }

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const ev of events) {
          const line = ev.split("\n").find((l) => l.startsWith("data:"));
          if (!line) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const obj = JSON.parse(payload);
            // AI SDK v5 UI stream: text-delta parts contain { type: 'text-delta', delta }
            if (typeof obj?.delta === "string") assistantText += obj.delta;
            else if (obj?.type === "text-delta" && typeof obj?.textDelta === "string")
              assistantText += obj.textDelta;
            else if (obj?.type === "text" && typeof obj?.text === "string")
              assistantText = obj.text;
            setMessages((cur) =>
              cur.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: assistantText } : m,
              ),
            );
          } catch {
            // ignore non-JSON lines
          }
        }
      }
      if (!assistantText) {
        setMessages((cur) =>
          cur.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "I couldn't generate a response. Please try again." }
              : m,
          ),
        );
      }
      setStats((s => ({ chatsCompleted: (s?.chatsCompleted ?? 0) + 1 }))(undefined as never) as never);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setMessages((cur) =>
        cur.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: "Sorry — I ran into an issue reaching the AI service. Please try again." }
            : m,
        ),
      );
    } finally {
      setStatus("idle");
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const clearConversation = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStatus("idle");
  };

  const saveConversation = () => {
    if (messages.length === 0) return;
    const first = messages.find((m) => m.role === "user")?.content ?? "Conversation";
    addChat({
      id: newId(),
      createdAt: Date.now(),
      title: first.slice(0, 80),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    toast.success("Conversation saved locally");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <TopBar title="TrudyM Chat Assistant" />
      <main className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
        <PageHeader
          title="TrudyM Chat Assistant"
          description="Ask, brainstorm, summarise, rewrite — a workplace assistant at your side."
          actions={
            <>
              <Button size="sm" variant="outline" onClick={saveConversation} disabled={!messages.length}>
                <Save className="mr-1.5 h-4 w-4" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={clearConversation} disabled={!messages.length}>
                <Trash2 className="mr-1.5 h-4 w-4" /> Clear
              </Button>
            </>
          }
        />
        <ResponsibleAI feature="chat" />

        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {messages.length === 0 ? (
              <EmptyState onPick={(q) => setInput(q)} />
            ) : (
              <ul className="mx-auto flex max-w-3xl flex-col gap-5">
                {messages.map((m) => (
                  <li key={m.id} className={m.role === "user" ? "flex justify-end" : "flex gap-3"}>
                    {m.role === "assistant" && (
                      <img src={logo} alt="TrudyM" width={28} height={28} className="mt-1 h-7 w-7 shrink-0 rounded-md" />
                    )}
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-[var(--shadow-soft)]"
                          : "max-w-[85%] min-w-0 flex-1"
                      }
                    >
                      {m.role === "user" ? (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      ) : m.content ? (
                        <Markdown text={m.content} />
                      ) : (
                        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> TrudyM is thinking…
                        </div>
                      )}
                    </div>
                    {m.role === "user" && (
                      <div className="mt-1 hidden h-7 w-7 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground sm:grid">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <CardContent className="border-t bg-background/80 p-3 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Message TrudyM… (Shift+Enter for newline)"
                className="min-h-[52px] max-h-40 resize-none"
              />
              <Button onClick={send} disabled={!input.trim() || status !== "idle"} size="lg">
                {status !== "idle" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  const suggestions = [
    "Summarise this meeting transcript into action items",
    "Rewrite this paragraph in a more professional tone",
    "Draft a project update for my manager",
    "Brainstorm ideas for our Q4 team offsite",
  ];
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center py-10 text-center">
      <img src={logo} alt="TrudyM" width={64} height={64} className="mb-4 h-16 w-16 rounded-2xl shadow-[var(--shadow-elegant)]" />
      <h3 className="text-lg font-semibold">Hi, I'm TrudyM</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Your workplace AI assistant. Ask me to draft, rewrite, summarise, or plan.
      </p>
      <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border bg-background p-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent/50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
