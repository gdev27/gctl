import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="page">
      <article className="card">
        <h3>Not found</h3>
        <p className="muted">The requested record could not be found or is no longer indexed.</p>
        <p className="mb-0">
          <Link href="/">Back to dashboard</Link>
        </p>
      </article>
    </section>
  );
}
