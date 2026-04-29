"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "../../components/empty-state";
import { FallbackBanner } from "../../components/fallback-banner";
import { PageHeader } from "../../components/page-header";
import { getOnboardingChecks } from "../../lib/api";
import { OnboardingCheck } from "../../lib/types";

export default function OnboardingPage() {
  const [checks, setChecks] = useState<OnboardingCheck[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadChecks() {
      try {
        const result = await getOnboardingChecks({ signal: controller.signal });
        if (controller.signal.aborted) {
          return;
        }
        setChecks(result.data);
        setDataSource(result.source);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadChecks();
    return () => controller.abort();
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
        <FallbackBanner message="Readiness checks are currently based on fallback data because live endpoints were unreachable." />
      ) : null}

      {loading ? (
        <article className="card" role="status" aria-live="polite">
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
              <p className="muted mb-0">{check.detail}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
