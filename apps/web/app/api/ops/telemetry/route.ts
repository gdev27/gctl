import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const origin = request.headers.get("origin");
    if (origin) {
      const requestHost = new URL(request.url).host;
      const originHost = new URL(origin).host;
      if (requestHost !== originHost) {
        return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
      }
    }
    const payload = await request.json();
    console.info("[web-vitals]", payload);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
}
