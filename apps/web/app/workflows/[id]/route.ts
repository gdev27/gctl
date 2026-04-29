import { NextResponse } from "next/server";
import { mockWorkflows } from "../../../lib/mock-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const workflow = mockWorkflows.find((entry) => entry.runId === id || entry.workflowId === id);
  if (!workflow) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(workflow);
}
