import { NextResponse } from "next/server";
import { mockWorkflows } from "../../../lib/mock-data";

export async function GET(): Promise<NextResponse> {
  const alerts = mockWorkflows.filter((entry) => entry.state === "reverted" || entry.state === "timed_out" || entry.state === "denied");
  return NextResponse.json(alerts);
}
