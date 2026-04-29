"use client";

import { useEffect, useState } from "react";
import { CopyTextButton } from "../../components/copy-text-button";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { getIdentityEvidence } from "../../lib/api";
import { IdentityEvidence } from "../../lib/types";

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<IdentityEvidence[]>([]);
  const [dataSource, setDataSource] = useState<"live" | "fallback">("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await getIdentityEvidence();
      setEvidence(result.data);
      setDataSource(result.source);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="page">
      <PageHeader
        eyebrow="Evidence"
        title="Identity and attestation receipts"
        description="Use this view to verify who acted, what was attested, and where audit artifacts are stored."
      />
      {dataSource === "fallback" ? (
        <article className="card card-tight">
          <span className="pill warn">Demo fallback data</span>
          <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
            Evidence rows are currently fallback snapshots and should not be treated as live attestations.
          </p>
        </article>
      ) : null}
      {loading ? (
        <article className="card">
          <p className="muted">Loading identity evidence...</p>
        </article>
      ) : evidence.length === 0 ? (
        <EmptyState
          title="No evidence records yet"
          description="Evidence will appear after runs write identity and attestation artifacts."
        />
      ) : (
        <article className="card">
          <div className="table-wrap">
            <table aria-label="Identity and evidence">
              <thead>
                <tr>
                  <th>ENS Name</th>
                  <th>Role</th>
                  <th>Capabilities</th>
                  <th>Attestation</th>
                  <th>Audit Path</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map((row) => (
                  <tr key={row.ensName}>
                    <td>
                      <div className="row-between">
                        <span className="mono">{row.ensName}</span>
                        <CopyTextButton value={row.ensName} />
                      </div>
                    </td>
                    <td>{row.role}</td>
                    <td>{row.capabilities.join(", ")}</td>
                    <td>
                      <div className="row-between">
                        <span className="mono">{row.attestation}</span>
                        <CopyTextButton value={row.attestation} />
                      </div>
                    </td>
                    <td>
                      <div className="row-between">
                        <span className="mono">{row.auditPath}</span>
                        <CopyTextButton value={row.auditPath} />
                      </div>
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
