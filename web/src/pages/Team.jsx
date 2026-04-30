import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/gctlClient";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, Lock } from "lucide-react";
import PageHeader from "../components/app/PageHeader";
import ConfirmDialog from "../components/app/ConfirmDialog";
import { SkeletonRow } from "../components/app/Skeleton";
import { useToast } from "@/components/ui/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import RoleLegend from "../components/team/RoleLegend";
import MemberRow from "../components/team/MemberRow";
import InviteMemberDialog from "../components/team/InviteMemberDialog";
import RoleBadge from "../components/app/RoleBadge";
import IdentityEvidencePanel from "../components/trust/IdentityEvidencePanel";

export default function Team() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const perms = usePermissions();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => base44.entities.TeamMember.filter({ status: ["invited", "active"] }, "-created_date"),
  });

  // Filter out removed members client-side as a defensive layer
  const visible = members.filter((m) => m.status !== "removed");

  const inviteMut = useMutation({
    mutationFn: async (data) => {
      // 1) record the membership
      const member = await base44.entities.TeamMember.create({
        email: data.email.toLowerCase(),
        full_name: data.full_name || "",
        role: data.role,
        status: "invited",
        invited_at: new Date().toISOString(),
      });
      // 2) send the actual invite via base44 (best effort — don't block on failure)
      try {
        await base44.users.inviteUser(data.email, data.role === "admin" ? "admin" : "user");
      } catch (e) {
        console.warn("Platform invite failed (membership still recorded):", e?.message);
      }
      return member;
    },
    onSuccess: (m) => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      setInviteOpen(false);
      toast({ title: "Invite sent", description: `${m.email} was invited as ${m.role}.` });
    },
    onError: (e) => {
      toast({ title: "Invite failed", description: e.message, variant: "destructive" });
    },
  });

  const roleMut = useMutation({
    mutationFn: ({ id, role }) => base44.entities.TeamMember.update(id, { role }),
    onSuccess: (_, { role }) => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Role updated", description: `Member is now ${role}.` });
    },
  });

  const removeMut = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.update(id, { status: "removed" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Member removed" });
    },
  });

  if (!perms.canManageTeam) {
    return (
      <div className="flex-1">
        <PageHeader eyebrow="// team" title="Team" description="Workspace members and their roles." />
        <div className="px-6 lg:px-10 py-8 space-y-6">
          <div className="rounded-xl border border-dashed border-border bg-card/20 p-10 text-center">
            <Lock className="w-7 h-7 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
            <p className="font-serif text-2xl mb-2">Read-only access</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Your role is <RoleBadge role={perms.role} /> — only admins can invite or modify members. Below is the list of teammates.
            </p>
          </div>
          <RoleLegend />
          <MembersTable
            isLoading={isLoading}
            members={visible}
            currentUserEmail={perms.user?.email}
            canManage={false}
            onRoleChange={() => {}}
            onRemove={() => {}}
          />
          <IdentityEvidencePanel />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <PageHeader
        eyebrow="// team"
        title="Team"
        description="Invite teammates and assign roles to control what they can do."
        action={
          <Button onClick={() => setInviteOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <UserPlus className="w-4 h-4" /> Invite member
          </Button>
        }
      />

      <div className="px-6 lg:px-10 py-8 space-y-8">
        <RoleLegend />

        <MembersTable
          isLoading={isLoading}
          members={visible}
          currentUserEmail={perms.user?.email}
          canManage={true}
          onRoleChange={(member, role) => roleMut.mutate({ id: member.id, role })}
          onRemove={(member) => setConfirmRemove(member)}
          onInvite={() => setInviteOpen(true)}
        />

        <IdentityEvidencePanel />
      </div>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={(data) => inviteMut.mutate(data)}
        isPending={inviteMut.isPending}
      />
      <ConfirmDialog
        open={!!confirmRemove}
        onOpenChange={(o) => !o && setConfirmRemove(null)}
        onConfirm={() => confirmRemove && removeMut.mutate(confirmRemove.id)}
        title="Remove member?"
        description={`${confirmRemove?.email} will lose access to the workspace immediately.`}
        confirmLabel="Remove"
      />
    </div>
  );
}

function MembersTable({ isLoading, members, currentUserEmail, canManage, onRoleChange, onRemove, onInvite }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h2 className="font-medium inline-flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
          Members <span className="text-xs font-mono text-muted-foreground">{members.length}</span>
        </h2>
      </div>
      {isLoading ? (
        <table className="w-full">
          <thead className="bg-background/40 border-b border-border">
            <tr>
              <Th>Member</Th><Th>Role</Th><Th>Status</Th><Th>Invited</Th><Th />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}
          </tbody>
        </table>
      ) : members.length === 0 ? (
        <div className="p-12 text-center">
          <Users className="w-7 h-7 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
          <p className="font-medium">No members yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Invite teammates to collaborate on this workspace.</p>
          {canManage && onInvite && (
            <Button onClick={onInvite} variant="outline" size="sm" className="gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> Invite member
            </Button>
          )}
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-background/40 border-b border-border">
            <tr>
              <Th>Member</Th><Th>Role</Th><Th>Status</Th><Th>Invited</Th><Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                currentUserEmail={currentUserEmail}
                canManage={canManage}
                onRoleChange={onRoleChange}
                onRemove={onRemove}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Th({ children }) {
  return <th className="text-left px-5 py-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{children}</th>;
}