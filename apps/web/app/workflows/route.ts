import { NextResponse } from "next/server";
import { mockWorkflows } from "../../lib/mock-data";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(mockWorkflows);
}
