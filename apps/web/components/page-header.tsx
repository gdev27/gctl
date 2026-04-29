import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="row-between">
        <span className="eyebrow">{eyebrow}</span>
        {actions ? <div className="row">{actions}</div> : null}
      </div>
      <h1>{title}</h1>
      <p className="muted">{description}</p>
    </header>
  );
}
