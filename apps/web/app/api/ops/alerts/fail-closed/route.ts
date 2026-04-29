import { NextResponse } from "next/server";
import { loadFailClosed } from "../../_lib/data";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(await loadFailClosed());
}
