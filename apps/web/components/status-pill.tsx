import { statusLabel, statusReason, statusTone } from "../lib/status";

export function StatusPill({ state }: { state: string }) {
  const tone = statusTone(state);
  return (
    <span className={`pill ${tone}`} title={statusReason(state)}>
      {statusLabel(state)}
    </span>
  );
}
