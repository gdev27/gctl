"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { getOnboardingChecks } from "../../lib/api";
import { OnboardingCheck } from "../../lib/types";

export default function OnboardingPage() {
  const [checks, setChecks] = useState<OnboardingCheck[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await getOnboardingChecks();
      setChecks(result.data);
      setDataSource(result.source);
      setLoading(false);
    })();
  }, []);

  const completedCount = checks.filter((check) => check.status === "ok").length;

  return (
    <section className="page">
      <PageHeader
        eyebrow="Readiness"
        title="Environment readiness checks"
        description="Complete these checks before running actions. A healthy setup should be ready in under two minutes."
      />

      <article className="card card-tight row-between">
        <div>
          <h3>Checklist progress</h3>
          <p className="muted">
            {completedCount} of {checks.length} checks currently passing.
          </p>
        </div>
        <span className={`pill ${completedCount === checks.length ? "ok" : "warn"}`}>
          {completedCount === checks.length ? "Ready" : "Needs attention"}
        </span>
      </article>

      {dataSource === "fallback" ? (
        <article className="card card-tight">
          <span className="pill warn">Demo fallback data</span>
          <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
            Readiness checks are currently based on fallback data because live endpoints were unreachable.
          </p>
        </article>
      ) : null}

      {loading ? (
        <article className="card">
          <p className="muted">Loading readiness checks...</p>
        </article>
      ) : checks.length === 0 ? (
        <EmptyState
          title="No checks available"
          description="No readiness checks were returned. Verify your indexer connection in Settings."
          ctaHref="/settings"
          ctaLabel="Open settings"
        />
      ) : (
        <div className="grid">
          {checks.map((check) => (
            <article key={check.key} className="card">
              <div className="row-between">
                <h3>{check.label}</h3>
                <span className={`pill ${check.status}`}>
                  {check.status === "ok" ? "Healthy" : check.status === "warn" ? "Review" : "Blocked"}
                </span>
              </div>
              <p className="muted" style={{ marginBottom: 0 }}>{check.detail}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
