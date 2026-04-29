import { NextResponse } from "next/server";
import { loadWorkflows } from "../_lib/data";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(await loadWorkflows());
}
