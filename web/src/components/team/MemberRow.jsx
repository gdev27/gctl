import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Mail } from "lucide-react";
import { ROLES } from "@/lib/permissions";
import RoleBadge from "../app/RoleBadge";
import { formatDistanceToNow } from "date-fns";

export default function MemberRow({ member, currentUserEmail, canManage, onRoleChange, onRemove }) {
  const isSelf = member.email === currentUserEmail;
  const initials = (member.full_name || member.email).slice(0, 2).toUpperCase();

  return (
    <tr className="hover:bg-accent/20 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-mono text-xs">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate flex items-center gap-2">
              {member.full_name || member.email.split("@")[0]}
              {isSelf && <span className="text-[10px] font-mono text-muted-foreground border border-border px-1 rounded">you</span>}
            </div>
            <div className="text-xs text-muted-foreground font-mono inline-flex items-center gap-1">
              <Mail className="w-3 h-3" /> {member.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        {canManage && !isSelf ? (
          <Select value={member.role} onValueChange={(v) => onRoleChange(member, v)}>
            <SelectTrigger className="w-32 h-8 bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ROLES).map(([k, r]) => (
                <SelectItem key={k} value={k}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <RoleBadge role={member.role} />
        )}
      </td>
      <td className="px-5 py-4">
        <span className={`text-xs font-mono ${member.status === "active" ? "text-primary" : "text-muted-foreground"}`}>
          {member.status === "active" ? "● active" : member.status === "invited" ? "○ invited" : member.status}
        </span>
      </td>
      <td className="px-5 py-4 text-xs font-mono text-muted-foreground">
        {member.invited_at ? formatDistanceToNow(new Date(member.invited_at), { addSuffix: true }) : "—"}
      </td>
      <td className="px-5 py-4 text-right">
        {canManage && !isSelf && (
          <button
            onClick={() => onRemove(member)}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
            title="Remove member"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}