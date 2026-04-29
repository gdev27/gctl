import { mockChecks, mockIdentityEvidence, mockOverview, mockPolicies, mockWorkflows } from "./mock-data";
import { IdentityEvidence, IndexedPolicy, IndexedWorkflow, OnboardingCheck, OpsOverview } from "./types";

export type DataSource = "live" | "fallback";
export type TrustStatus = "healthy" | "degraded" | "fallback";

export type DataResult<T> = {
  data: T;
  source: DataSource;
  trustStatus?: TrustStatus;
  reasonCode?: string;
  recoveryAction?: string;
};

async function fetchJson<T>(path: string, fallback: T): Promise<DataResult<T>> {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) {
      return { data: fallback, source: "fallback" };
    }
    const payload = (await res.json()) as T | DataResult<T>;
    if (typeof payload === "object" && payload !== null && "data" in payload && "source" in payload) {
      return payload as DataResult<T>;
    }
    return { data: payload as T, source: "live" };
  } catch {
    return { data: fallback, source: "fallback" };
  }
}

export async function getOverview(): Promise<DataResult<OpsOverview>> {
  return fetchJson<OpsOverview>("/api/ops/overview", mockOverview);
}

export async function getPolicies(): Promise<DataResult<IndexedPolicy[]>> {
  return fetchJson<IndexedPolicy[]>("/api/ops/policies", mockPolicies);
}

export async function getWorkflows(): Promise<DataResult<IndexedWorkflow[]>> {
  return fetchJson<IndexedWorkflow[]>("/api/ops/workflows", mockWorkflows);
}

export async function getOnboardingChecks(): Promise<DataResult<OnboardingCheck[]>> {
  return fetchJson<OnboardingCheck[]>("/api/ops/onboarding-checks", mockChecks);
}

export async function getIdentityEvidence(): Promise<DataResult<IdentityEvidence[]>> {
  return fetchJson<IdentityEvidence[]>("/api/ops/evidence", mockIdentityEvidence);
}
