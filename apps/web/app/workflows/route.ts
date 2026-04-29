import { NextResponse } from "next/server";
import { loadWorkflows } from "../api/ops/_lib/data";

export async function GET(): Promise<NextResponse> {
  const workflowsResult = await loadWorkflows();
  return NextResponse.json(workflowsResult.data);
}
