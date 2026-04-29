import { NextResponse } from "next/server";
import { loadWorkflows } from "../../_lib/data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const workflowsResult = await loadWorkflows();
  const workflow = workflowsResult.data.find((entry) => entry.runId === id || entry.workflowId === id);
  if (!workflow) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({
    source: workflowsResult.source,
    trustStatus: workflowsResult.trustStatus,
    reasonCode: workflowsResult.reasonCode,
    recoveryAction: workflowsResult.recoveryAction,
    data: workflow
  });
}
