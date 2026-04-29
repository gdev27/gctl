"use client";

import { useReportWebVitals } from "next/web-vitals";

export function Telemetry() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }
    // Replace console sink with remote collector when backend telemetry endpoint is available.
    console.debug("[web-vitals]", metric.name, metric.value);
  });

  return null;
}
