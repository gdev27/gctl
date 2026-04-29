import { statusLabel, statusReason, statusTone } from "../lib/status";

export function StatusPill({ state }: { state: string }) {
  const tone = statusTone(state);
  const icon = tone === "ok" ? "OK" : tone === "warn" ? "!" : "X";
  return (
    <span
      className={`pill ${tone}`}
      title={statusReason(state)}
      aria-label={`${statusLabel(state)}. ${statusReason(state)}`}
    >
      <span aria-hidden="true">{icon}</span>
      {statusLabel(state)}
    </span>
  );
}
