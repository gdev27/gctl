import { NextResponse } from "next/server";
import { loadOverview } from "../_lib/data";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(await loadOverview());
}
