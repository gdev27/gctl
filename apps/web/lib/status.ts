export function statusTone(state: string): "ok" | "warn" | "bad" {
  if (state === "succeeded" || state === "running") {
    return "ok";
  }
  if (state === "partial_fill" || state === "timed_out") {
    return "warn";
  }
  return "bad";
}

export function statusLabel(state: string): string {
  const labels: Record<string, string> = {
    succeeded: "Succeeded",
    running: "Running",
    partial_fill: "Partial Fill",
    timed_out: "Timed Out",
    reverted: "Reverted",
    denied: "Denied",
    cancelled: "Cancelled"
  };
  return labels[state] ?? state.replaceAll("_", " ");
}

export function statusReason(state: string): string {
  const reasons: Record<string, string> = {
    succeeded: "Execution completed and reconciliation evidence is available.",
    running: "Execution is in progress with live status polling.",
    partial_fill: "Execution completed with partial fulfillment and needs review.",
    timed_out: "Workflow did not finish in time and failed closed for safety.",
    reverted: "Execution reverted to preserve policy constraints.",
    denied: "Policy engine blocked the action before execution.",
    cancelled: "Execution was cancelled by workflow control."
  };
  return reasons[state] ?? "State details are available in run evidence.";
}
