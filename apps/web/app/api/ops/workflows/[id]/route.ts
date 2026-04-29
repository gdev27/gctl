import { NextResponse } from "next/server";
import { loadWorkflowById } from "../../_lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  if (!/^[a-zA-Z0-9:_-]{3,128}$/.test(id)) {
    return NextResponse.json(
      {
        error: "invalid_id",
        reasonCode: "INVALID_ID_FORMAT",
        recoveryAction: "Use a valid run or workflow identifier."
      },
      { status: 400 }
    );
  }
  const workflowsResult = await loadWorkflowById(id);
  const workflow = workflowsResult.data;
  if (!workflow) {
    return NextResponse.json(
      {
        error: "not_found",
        reasonCode: "RUN_NOT_FOUND",
        recoveryAction: "Verify the run identifier and retry."
      },
      { status: 404 }
    );
  }
  return NextResponse.json({
    source: workflowsResult.source,
    trustStatus: workflowsResult.trustStatus,
    reasonCode: workflowsResult.reasonCode,
    recoveryAction: workflowsResult.recoveryAction,
    data: workflow
  });
}
