import { describe, expect, it } from "vitest";
import { statusLabel, statusTone } from "./status";

describe("status helpers", () => {
  it("maps critical failures to bad", () => {
    expect(statusTone("reverted")).toBe("bad");
    expect(statusTone("denied")).toBe("bad");
  });

  it("normalizes underscored labels", () => {
    expect(statusLabel("partial_fill")).toBe("Partial Fill");
  });
});
