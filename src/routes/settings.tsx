import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { TopBar } from "@/components/topbar";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clearAllLocalData, useSettings } from "@/lib/local-store";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TrudyM AI" },
      { name: "description", content: "Preferences for tone, defaults, theme, and privacy." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, update, reset] = useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <TopBar title="Settings" />
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        <PageHeader title="Settings" description="Configure defaults, appearance, and privacy." />

        <Card>
          <CardHeader>
            <CardTitle>AI defaults</CardTitle>
            <CardDescription>Used across the Email Generator, Planner, and Chat.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Preferred tone</Label>
              <Select value={settings.tone} onValueChange={(v) => update({ tone: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Formal", "Friendly", "Informal", "Professional", "Persuasive"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default email style</Label>
              <Select value={settings.emailStyle} onValueChange={(v) => update({ emailStyle: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Concise", "Balanced", "Detailed"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default response length</Label>
              <Select value={settings.responseLength} onValueChange={(v) => update({ responseLength: v as never })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hours">Working hours</Label>
              <Input id="hours" value={settings.workingHours} onChange={(e) => update({ workingHours: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Language</Label>
              <Select value={settings.language} onValueChange={(v) => update({ language: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["English", "Spanish", "French", "German", "Portuguese"].map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Theme</Label>
              <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Optional in-app cues for generation success and errors.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="font-medium">Enable notifications</div>
              <div className="text-xs text-muted-foreground">Toast notifications on generation events.</div>
            </div>
            <Switch checked={settings.notifications} onCheckedChange={(v) => update({ notifications: v })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy & data</CardTitle>
            <CardDescription>
              TrudyM AI does not use a database. Everything you save stays on this device and can be
              cleared at any time.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Clear all local history (emails, plans, chats)?")) {
                  ["trudym.emails", "trudym.plans", "trudym.chats"].forEach((k) =>
                    window.localStorage.removeItem(k),
                  );
                  window.dispatchEvent(new CustomEvent("trudym:storage", { detail: "*" }));
                  toast.success("Local history cleared");
                }
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Clear local history
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Clear ALL locally stored data (history + settings)?")) {
                  clearAllLocalData();
                  reset();
                  toast.success("All local data cleared");
                }
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Clear all locally stored data
            </Button>
            <Button variant="ghost" onClick={() => { reset(); toast.success("Settings reset"); }}>
              Reset settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Notice</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            TrudyM AI Workplace Productivity Assistant is designed with privacy in mind. No registration or
            login is required. The application does not use a database or permanently store user
            credentials, emails, task plans, chat conversations, or AI-generated content. Any information
            you choose to save remains only on your own device and can be deleted at any time.
          </CardContent>
        </Card>
      </main>
    </>
  );
}
