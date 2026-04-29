import { NextResponse } from "next/server";
import { loadPolicies } from "../../../api/ops/_lib/data";

export async function GET(): Promise<NextResponse> {
  const policiesResult = await loadPolicies();
  return NextResponse.json(policiesResult.data);
}
