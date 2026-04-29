import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

type TrustEvidence = {
  ens: {
    roleIdentities: Array<{
      ensName: string;
      role: string;
      capabilities: string[];
      verifiedReverse: boolean;
    }>;
  };
  workflows: Array<{
    runId: string;
    workflowId: string;
    state: string;
    pathType: string;
    auditPath: string;
    logRef: string;
    analyticsRef: string;
  }>;
  attestation: {
    kind: "onchain" | "simulated";
    txHash?: string;
    receipt: string;
    mappedRunIds: string[];
  };
};

async function readJson<T>(relativePath: string): Promise<T> {
  const filePath = path.join(process.cwd(), relativePath);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

describe("submission trust claims", () => {
  it("includes ENS role/subname metadata evidence for all core roles", async () => {
    const evidence = await readJson<TrustEvidence>("docs/evidence/trust-evidence.json");
    const roles = new Set(evidence.ens.roleIdentities.map((entry) => entry.role));

    expect(roles.has("planner")).toBe(true);
    expect(roles.has("researcher")).toBe(true);
    expect(roles.has("critic")).toBe(true);
    expect(roles.has("executor")).toBe(true);

    for (const identity of evidence.ens.roleIdentities) {
      expect(identity.ensName.endsWith(".eth")).toBe(true);
      expect(identity.capabilities.length).toBeGreaterThan(0);
      expect(identity.verifiedReverse).toBe(true);
    }
  });

  it("contains KeeperHub status, logs, and analytics references per workflow", async () => {
    const evidence = await readJson<TrustEvidence>("docs/evidence/trust-evidence.json");
    expect(evidence.workflows.length).toBeGreaterThan(0);

    for (const workflow of evidence.workflows) {
      expect(workflow.workflowId.length).toBeGreaterThan(0);
      expect(workflow.runId.length).toBeGreaterThan(0);
      expect(workflow.state.length).toBeGreaterThan(0);
      expect(workflow.auditPath.length).toBeGreaterThan(0);
      expect(workflow.logRef.length).toBeGreaterThan(0);
      expect(workflow.analyticsRef.length).toBeGreaterThan(0);
    }
  });

  it("maps attestation evidence to known workflow run IDs", async () => {
    const evidence = await readJson<TrustEvidence>("docs/evidence/trust-evidence.json");
    const runIds = new Set(evidence.workflows.map((workflow) => workflow.runId));

    expect(evidence.attestation.mappedRunIds.length).toBeGreaterThan(0);
    for (const mappedRunId of evidence.attestation.mappedRunIds) {
      expect(runIds.has(mappedRunId)).toBe(true);
    }

    if (evidence.attestation.kind === "onchain") {
      expect(evidence.attestation.txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    } else {
      expect(evidence.attestation.receipt.startsWith("simulated-attestation:")).toBe(true);
    }
  });

  it("avoids hardcoded demo ENS values in runtime-critical files", async () => {
    const filesToCheck = [
      "scripts/demoDeterministic.ts",
      "scripts/demoSmallTrade.ts",
      "scripts/demoLargeTrade.ts",
      "apps/web/app/api/ops/_lib/data.ts"
    ];
    const bannedLiterals = ["eurofund.eth", "algo1.eurofund.eth", "demo.gctl.eth"];

    for (const file of filesToCheck) {
      const content = await readFile(path.join(process.cwd(), file), "utf8");
      for (const literal of bannedLiterals) {
        expect(content.includes(literal), `${file} should not include ${literal}`).toBe(false);
      }
    }
  });
});
