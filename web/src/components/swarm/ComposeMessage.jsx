import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, ShieldCheck, Megaphone, MessageSquare } from "lucide-react";

const KINDS = [
  { value: "status", label: "Status update", icon: MessageSquare, hint: "Share what your agent is doing." },
  { value: "broadcast", label: "Broadcast", icon: Megaphone, hint: "Visible to all agents." },
  { value: "verification_request", label: "Verification request", icon: ShieldCheck, hint: "Requires sign-off from selected agents before tx." },
];

const empty = {
  kind: "status",
  agent_id: "",
  subject: "",
  body: "",
  target_agent_ids: [],
};

export default function ComposeMessage({ agents, onSend }) {
  const [form, setForm] = React.useState(empty);

  React.useEffect(() => {
    if (!form.agent_id && agents.length > 0) setForm((f) => ({ ...f, agent_id: agents[0].id }));
  }, [agents, form.agent_id]);

  const sender = agents.find((a) => a.id === form.agent_id);
  const others = agents.filter((a) => a.id !== form.agent_id);

  const toggleTarget = (id) => {
    setForm((f) => ({
      ...f,
      target_agent_ids: f.target_agent_ids.includes(id)
        ? f.target_agent_ids.filter((x) => x !== id)
        : [...f.target_agent_ids, id],
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.body && !form.subject) return;
    onSend({
      kind: form.kind,
      agent_id: form.agent_id,
      agent_name: sender?.name,
      subject: form.subject,
      body: form.body,
      target_agent_ids: form.kind === "verification_request" ? form.target_agent_ids : [],
      verification_status: form.kind === "verification_request" ? "pending" : undefined,
    });
    setForm({ ...empty, agent_id: form.agent_id });
  };

  const activeKind = KINDS.find((k) => k.value === form.kind);

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">From agent</Label>
          <Select value={form.agent_id} onValueChange={(v) => setForm({ ...form, agent_id: v })}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select agent" /></SelectTrigger>
            <SelectContent>
              {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Kind</Label>
          <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KINDS.map((k) => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeKind && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <activeKind.icon className="w-3 h-3" /> {activeKind.hint}
        </p>
      )}

      <div>
        <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Subject</Label>
        <Input
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder={form.kind === "verification_request" ? "Approval needed for cross-chain bridge" : "Status headline"}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Message</Label>
        <Textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="Details, reasoning, or context…"
          rows={3}
          className="mt-1.5 resize-none"
        />
      </div>

      {form.kind === "verification_request" && others.length > 0 && (
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Request sign-off from</Label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {others.map((a) => {
              const on = form.target_agent_ids.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleTarget(a.id)}
                  className={`text-xs font-mono px-2 py-1 rounded border transition-colors ${
                    on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" disabled={!form.agent_id}>
          <Send className="w-3.5 h-3.5" /> Post to bus
        </Button>
      </div>
    </form>
  );
}