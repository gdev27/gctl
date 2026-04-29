"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="page">
      <article className="card">
        <h3>Unable to load this view</h3>
        <p className="muted">
          The app failed closed to avoid showing unreliable state. Retry, then validate readiness if the issue
          continues.
        </p>
        {error.digest ? <p className="muted">Reference: {error.digest}</p> : null}
        <button type="button" className="btn" onClick={() => reset()}>
          Retry
        </button>
      </article>
    </section>
  );
}
