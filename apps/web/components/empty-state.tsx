import Link from "next/link";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="empty-state card">
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {ctaHref && ctaLabel ? (
        <div>
          <Link href={ctaHref} className="btn btn-primary">
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
