import { NextResponse } from "next/server";
import { loadEvidence } from "../_lib/data";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(await loadEvidence());
}
