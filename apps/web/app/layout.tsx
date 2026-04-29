import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Telemetry } from "../components/telemetry";
import { AppShell } from "../components/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: {
    default: "gctl Ops UI",
    template: "%s | gctl Ops UI"
  },
  description: "Policy-constrained operations dashboard for gctl.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "gctl Ops UI",
    description: "Policy-constrained operations dashboard for gctl.",
    siteName: "gctl Ops UI",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "gctl Ops UI",
    description: "Policy-constrained operations dashboard for gctl."
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060911"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Telemetry />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
