import { loadWorkflows } from "../api/ops/_lib/data";
import { RunsClient } from "./runs-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Runs",
  description: "Execution timeline and triage with fail-closed visibility."
};

export default async function RunsPage() {
  const workflowsResult = await loadWorkflows();
  return <RunsClient initialRuns={workflowsResult.data} initialSource={workflowsResult.source} />;
}
