import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SessionBanner } from "./session-banner";

describe("SessionBanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("restores persisted view mode and persists toggles", () => {
    window.localStorage.setItem("gctl.session.viewMode", "investigation");
    render(<SessionBanner />);

    expect(screen.getByText(/View preference: investigation/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /switch to overview/i }));
    expect(window.localStorage.getItem("gctl.session.viewMode")).toBe("overview");
  });

  it("updates display mode when settings event is dispatched", () => {
    window.localStorage.setItem("gctl.settings.mode", "live");
    render(<SessionBanner />);
    window.dispatchEvent(new Event("gctl:settings-updated"));

    expect(screen.getByText(/Live-data wording/i)).toBeInTheDocument();
  });
});
