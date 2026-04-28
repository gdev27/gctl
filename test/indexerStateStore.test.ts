import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fsMock = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn()
};

vi.mock("node:fs/promises", () => ({
  default: fsMock
}));

describe("indexer state store", () => {
  beforeEach(() => {
    vi.resetModules();
    fsMock.readFile.mockReset();
    fsMock.writeFile.mockReset();
    fsMock.mkdir.mockReset();
    fsMock.mkdir.mockResolvedValue(undefined);
    fsMock.writeFile.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("serializes concurrent mutations without clobbering state", async () => {
    fsMock.readFile.mockRejectedValue(Object.assign(new Error("not found"), { code: "ENOENT" }));
    const { mutateIndexedState } = await import("../indexer/src/stateStore");

    await Promise.all([
      mutateIndexedState((state) => {
        state.policies.alpha = {
          policyId: "alpha",
          hash: "0x1",
          uri: "file://alpha",
          active: true,
          updatedAt: 1
        };
      }),
      mutateIndexedState((state) => {
        state.workflows.run_1 = {
          runId: "run_1",
          workflowId: "wf_1",
          policyId: "alpha",
          state: "succeeded",
          auditPath: "/tmp/audit",
          updatedAt: 2
        };
      })
    ]);

    const lastWritePayload = fsMock.writeFile.mock.calls.at(-1)?.[1] as string;
    const persisted = JSON.parse(lastWritePayload);
    expect(persisted.policies.alpha.policyId).toBe("alpha");
    expect(persisted.workflows.run_1.state).toBe("succeeded");
  });

  it("loads disk state once and serves subsequent reads from memory", async () => {
    fsMock.readFile.mockResolvedValue(
      JSON.stringify({
        policies: { alpha: { policyId: "alpha", hash: "0x1", uri: "file://alpha", active: true, updatedAt: 1 } },
        workflows: {}
      })
    );

    const { getIndexedStateSnapshot } = await import("../indexer/src/stateStore");
    const first = await getIndexedStateSnapshot();
    const second = await getIndexedStateSnapshot();

    expect(first.policies.alpha.policyId).toBe("alpha");
    expect(second.policies.alpha.policyId).toBe("alpha");
    expect(fsMock.readFile).toHaveBeenCalledTimes(1);
  });
});
