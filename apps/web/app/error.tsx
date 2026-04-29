"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <section className="page">
      <article className="card">
        <h3>Unable to load this view</h3>
        <p className="muted">
          The app failed closed to avoid showing unreliable state. Retry, then validate readiness if the issue continues.
        </p>
        <button type="button" className="btn" onClick={() => reset()}>
          Retry
        </button>
      </article>
    </section>
  );
}
