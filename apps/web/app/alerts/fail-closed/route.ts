import { NextResponse } from "next/server";
import { loadFailClosed } from "../../api/ops/_lib/data";

export async function GET(): Promise<NextResponse> {
  const alertsResult = await loadFailClosed();
  return NextResponse.json(alertsResult.data);
}
