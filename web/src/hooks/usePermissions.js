import { useAuth } from "@/lib/AuthContext";
import { capabilitiesFor, roleMeta } from "@/lib/permissions";

/**
 * Returns the current user's role and capability flags.
 * Falls back to "viewer" if the user has no role assigned yet.
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role || "viewer";
  return {
    user,
    role,
    meta: roleMeta(role),
    ...capabilitiesFor(role),
  };
}