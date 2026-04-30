// Role → capabilities mapping. Single source of truth for RBAC across the app.

export const ROLES = {
  admin: {
    label: "Admin",
    description: "Full control. Can manage agents, policies, approvals, and team members.",
    accent: "primary",
  },
  approver: {
    label: "Approver",
    description: "Can approve or reject pending transactions and toggle agents.",
    accent: "chart-2",
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access. Can track activity but cannot modify anything.",
    accent: "muted",
  },
};

const CAPABILITIES = {
  admin: {
    canManageAgents: true,
    canManagePolicies: true,
    canApproveTransactions: true,
    canRunAgents: true,
    canManageAlerts: true,
    canManageTeam: true,
    canSendSwarmMessages: true,
  },
  approver: {
    canManageAgents: false,
    canManagePolicies: false,
    canApproveTransactions: true,
    canRunAgents: true,
    canManageAlerts: false,
    canManageTeam: false,
    canSendSwarmMessages: true,
  },
  viewer: {
    canManageAgents: false,
    canManagePolicies: false,
    canApproveTransactions: false,
    canRunAgents: false,
    canManageAlerts: false,
    canManageTeam: false,
    canSendSwarmMessages: false,
  },
};

/**
 * Returns capability flags for a given role.
 * Defaults to "viewer" when role is missing or unknown.
 */
export function capabilitiesFor(role) {
  return CAPABILITIES[role] || CAPABILITIES.viewer;
}

export function roleMeta(role) {
  return ROLES[role] || ROLES.viewer;
}