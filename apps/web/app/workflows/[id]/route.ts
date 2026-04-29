import { NextResponse } from "next/server";
import { loadWorkflowById } from "../../api/ops/_lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const workflowResult = await loadWorkflowById(id);
  const workflow = workflowResult.data;
  if (!workflow) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(workflow);
}
