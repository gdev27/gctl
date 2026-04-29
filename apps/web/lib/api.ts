import { mockChecks, mockIdentityEvidence, mockOverview, mockPolicies, mockWorkflows } from "./mock-data";
import { IdentityEvidence, IndexedPolicy, IndexedWorkflow, OnboardingCheck, OpsOverview } from "./types";
import type { ZodType } from "zod";
import {
  identityEvidenceSchema,
  indexedPolicySchema,
  indexedWorkflowSchema,
  onboardingCheckSchema,
  opsOverviewSchema
} from "./schemas";

export type DataSource = "live" | "fallback";
export type TrustStatus = "healthy" | "degraded" | "fallback";

export type DataResult<T> = {
  data: T;
  source: DataSource;
  trustStatus?: TrustStatus;
  reasonCode?: string;
  recoveryAction?: string;
};

type FetchJsonOptions = {
  signal?: AbortSignal;
};

function isDataResult<T>(payload: unknown): payload is DataResult<T> {
  return typeof payload === "object" && payload !== null && "data" in payload && "source" in payload;
}

function validatePayload<T>(payload: unknown, schema: ZodType<T>): T | null {
  const validated = schema.safeParse(payload);
  return validated.success ? validated.data : null;
}

async function fetchJson<T>(
  path: string,
  fallback: T,
  schema: ZodType<T>,
  options: FetchJsonOptions = {}
): Promise<DataResult<T>> {
  try {
    const requestInit: RequestInit = {
      cache: "no-store"
    };
    if (options.signal) {
      requestInit.signal = options.signal;
    }
    const res = await fetch(path, requestInit);
    if (!res.ok) {
      return { data: fallback, source: "fallback" };
    }
    const payload: unknown = await res.json();
    if (isDataResult<T>(payload)) {
      const validatedData = validatePayload(payload.data, schema);
      if (validatedData === null) {
        return { data: fallback, source: "fallback", reasonCode: "INVALID_RESPONSE_SHAPE" };
      }
      return { ...payload, data: validatedData } as DataResult<T>;
    }
    const validatedPayload = validatePayload(payload, schema);
    if (validatedPayload === null) {
      return { data: fallback, source: "fallback", reasonCode: "INVALID_RESPONSE_SHAPE" };
    }
    return { data: validatedPayload, source: "live" };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    return { data: fallback, source: "fallback" };
  }
}

export async function getOverview(options?: FetchJsonOptions): Promise<DataResult<OpsOverview>> {
  return fetchJson<OpsOverview>("/api/ops/overview", mockOverview, opsOverviewSchema, options);
}

export async function getPolicies(options?: FetchJsonOptions): Promise<DataResult<IndexedPolicy[]>> {
  return fetchJson<IndexedPolicy[]>("/api/ops/policies", mockPolicies, indexedPolicySchema.array(), options);
}

export async function getWorkflows(options?: FetchJsonOptions): Promise<DataResult<IndexedWorkflow[]>> {
  return fetchJson<IndexedWorkflow[]>(
    "/api/ops/workflows",
    mockWorkflows,
    indexedWorkflowSchema.array(),
    options
  );
}

export async function getOnboardingChecks(
  options?: FetchJsonOptions
): Promise<DataResult<OnboardingCheck[]>> {
  return fetchJson<OnboardingCheck[]>(
    "/api/ops/onboarding-checks",
    mockChecks,
    onboardingCheckSchema.array(),
    options
  );
}

export async function getIdentityEvidence(
  options?: FetchJsonOptions
): Promise<DataResult<IdentityEvidence[]>> {
  return fetchJson<IdentityEvidence[]>(
    "/api/ops/evidence",
    mockIdentityEvidence,
    identityEvidenceSchema.array(),
    options
  );
}
