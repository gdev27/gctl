import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 180;
const requestCounts = new Map<string, { count: number; windowStart: number }>();

function getClientKey(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for") || "local";
  return ip.split(",")[0]?.trim() || "local";
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/ops")) {
    return NextResponse.next();
  }

  const key = getClientKey(request);
  const now = Date.now();
  const entry = requestCounts.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    requestCounts.set(key, { count: 1, windowStart: now });
    return NextResponse.next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return NextResponse.json(
      {
        error: "rate_limited",
        reasonCode: "RATE_LIMITED",
        recoveryAction: "Retry in one minute."
      },
      { status: 429 }
    );
  }

  entry.count += 1;
  requestCounts.set(key, entry);
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/ops/:path*"]
};
