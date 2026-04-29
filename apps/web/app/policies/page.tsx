"use client";

import { useEffect, useState } from "react";
import { CopyTextButton } from "../../components/copy-text-button";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { getPolicies } from "../../lib/api";
import { IndexedPolicy } from "../../lib/types";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<IndexedPolicy[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [amount, setAmount] = useState(10000);
  const [asset, setAsset] = useState("USDC");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await getPolicies();
      setPolicies(result.data);
      setDataSource(result.source);
      setLoading(false);
    })();
  }, []);

  const simulatedDecision = amount > 100000
    ? "Escalated path required: private routing and report step enabled."
    : "Safe path selected: batch auction route with standard controls.";

  return (
    <section className="page">
      <PageHeader
        eyebrow="Policy Control"
        title="Policy inventory and routing intent"
        description="Review active policy artifacts and test how trade amounts change routing behavior before execution."
      />

      <article className="card">
        <div className="card-header">
          <h3>Decision preview sandbox</h3>
          <p className="muted">Quickly evaluate safe versus escalated path behavior using sample intent values.</p>
        </div>
        <div className="grid grid-2">
          <label className="field">
            <span className="field-label">Asset symbol</span>
            <input
              className="input"
              value={asset}
              onChange={(event) => setAsset(event.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Amount</span>
            <input
              className="input"
              type="number"
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="card card-tight" style={{ marginTop: 16 }}>
          <p style={{ marginBottom: 0 }}>
            <strong>Simulated decision for {asset}: </strong>
            {simulatedDecision}
          </p>
        </div>
      </article>

      {dataSource === "fallback" ? (
        <article className="card card-tight">
          <span className="pill warn">Demo fallback data</span>
          <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
            Policy artifacts are displayed from fallback snapshots while live data is unavailable.
          </p>
        </article>
      ) : null}

      {loading ? (
        <article className="card">
          <p className="muted">Loading policy artifacts...</p>
        </article>
      ) : policies.length === 0 ? (
        <EmptyState
          title="No policies indexed"
          description="Add and register policy artifacts to see integrity and lifecycle state here."
        />
      ) : (
        <article className="card">
          <div className="card-header row-between">
            <h3>Registered policies</h3>
            <span className="pill neutral">{policies.length} records</span>
          </div>
          <div className="table-wrap">
            <table aria-label="Policies">
              <thead>
                <tr>
                  <th>Policy ID</th>
                  <th>Hash</th>
                  <th>URI</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.policyId}>
                    <td>
                      <div className="row-between">
                        <span className="mono">{policy.policyId}</span>
                        <CopyTextButton value={policy.policyId} />
                      </div>
                    </td>
                    <td>
                      <div className="row-between">
                        <span className="mono">{policy.hash}</span>
                        <CopyTextButton value={policy.hash} />
                      </div>
                    </td>
                    <td>
                      <div className="row-between">
                        <span className="mono">{policy.uri}</span>
                        <CopyTextButton value={policy.uri} />
                      </div>
                    </td>
                    <td>
                      <span className={`pill ${policy.active ? "ok" : "warn"}`}>
                        {policy.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}
