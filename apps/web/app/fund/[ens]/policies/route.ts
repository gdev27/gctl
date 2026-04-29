import { NextResponse } from "next/server";
import { mockPolicies } from "../../../../lib/mock-data";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(mockPolicies);
}
