export default function RunsLoading() {
  return (
    <section className="page">
      <article className="card">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line mt-2" />
      </article>
      <article className="card">
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line mt-2" />
        <div className="skeleton skeleton-line mt-2" />
      </article>
    </section>
  );
}
