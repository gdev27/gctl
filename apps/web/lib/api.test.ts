import { beforeEach, describe, expect, it, vi } from "vitest";
import { getWorkflows } from "./api";

describe("fetchJson validation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns fallback when payload shape is invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ not: "a workflow array" })
      })
    );

    const result = await getWorkflows();
    expect(result.source).toBe("fallback");
    expect(result.reasonCode).toBe("INVALID_RESPONSE_SHAPE");
  });

  it("accepts a typed DataResult response payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          source: "live",
          data: [
            {
              runId: "run_123",
              workflowId: "wf_123",
              policyId: "policy_1",
              state: "succeeded",
              auditPath: "/audit/run_123.json",
              updatedAt: Date.now()
            }
          ]
        })
      })
    );

    const result = await getWorkflows();
    expect(result.source).toBe("live");
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.runId).toBe("run_123");
  });
});
