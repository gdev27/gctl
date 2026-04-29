"use client";

import { useReportWebVitals } from "next/web-vitals";

export function Telemetry() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      console.debug("[web-vitals]", metric.name, metric.value);
    }
    void fetch("/api/ops/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metric)
    });
  });

  return null;
}
