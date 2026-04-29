type FallbackBannerProps = {
  message: string;
};

export function FallbackBanner({ message }: FallbackBannerProps) {
  return (
    <article className="card card-tight support-card">
      <span className="pill warn">Demo fallback data</span>
      <p className="muted mt-2 mb-0">{message}</p>
    </article>
  );
}
