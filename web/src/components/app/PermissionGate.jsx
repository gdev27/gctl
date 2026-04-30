import React from "react";
import { Lock } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

/**
 * Conditionally renders children only if the current user has the given capability.
 * Optional `fallback` lets you pass a read-only or placeholder UI.
 */
export default function PermissionGate({ capability, children, fallback = null }) {
  const perms = usePermissions();
  if (!perms[capability]) return fallback;
  return <>{children}</>;
}

/**
 * Inline, lightweight banner shown at the top of pages when the user is in a read-only role.
 */
export function ReadOnlyBanner({ message = "You're viewing this in read-only mode. Ask an admin to upgrade your role to make changes." }) {
  return (
    <div className="mx-6 lg:mx-10 mt-6 rounded-md border border-border bg-card/40 px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
      <Lock className="w-3.5 h-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}