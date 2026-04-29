import { NextResponse } from "next/server";
import { loadChecks } from "../_lib/data";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(await loadChecks());
}
