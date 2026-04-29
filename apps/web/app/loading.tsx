export default function Loading() {
  return (
    <section className="page">
      <div className="card">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line mt-2" />
        <div className="skeleton skeleton-line mt-2" />
      </div>
      <div className="grid grid-3">
        <div className="card">
          <div className="skeleton skeleton-metric" />
        </div>
        <div className="card">
          <div className="skeleton skeleton-metric" />
        </div>
        <div className="card">
          <div className="skeleton skeleton-metric" />
        </div>
      </div>
    </section>
  );
}
