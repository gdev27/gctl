import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLES } from "@/lib/permissions";
import { UserPlus } from "lucide-react";

const empty = { email: "", full_name: "", role: "viewer" };

export default function InviteMemberDialog({ open, onOpenChange, onSubmit, isPending }) {
  const [draft, setDraft] = React.useState(empty);

  React.useEffect(() => { if (!open) setDraft(empty); }, [open]);

  const valid = /\S+@\S+\.\S+/.test(draft.email);

  const submit = () => {
    if (!valid) return;
    onSubmit(draft);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center bg-primary/10 shrink-0">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-serif text-xl">Invite a team member</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1.5">
                They'll be added to your workspace with the role you choose.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Field label="Email">
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              placeholder="alex@example.com"
              className="bg-background"
            />
          </Field>
          <Field label="Full name (optional)">
            <Input
              value={draft.full_name}
              onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
              placeholder="Alex Chen"
              className="bg-background"
            />
          </Field>
          <Field label="Role">
            <Select value={draft.role} onValueChange={(v) => setDraft({ ...draft, role: v })}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLES).map(([k, r]) => (
                  <SelectItem key={k} value={k}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ROLES[draft.role].description}</p>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={submit} disabled={!valid || isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {isPending ? "Sending…" : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}