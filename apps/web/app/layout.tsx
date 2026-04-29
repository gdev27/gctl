import type { Metadata } from "next";
import "./globals.css";
import { Telemetry } from "../components/telemetry";
import { AppShell } from "../components/app-shell";

export const metadata: Metadata = {
  title: "gctl Ops UI",
  description: "Policy-constrained operations dashboard for gctl."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Telemetry />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
