import { mutateIndexedState } from "./stateStore";

export async function indexWorkflowOutcome(event: {
  runId: string;
  workflowId: string;
  policyId: string;
  state: string;
  auditPath: string;
  updatedAt: number;
}): Promise<void> {
  await mutateIndexedState((state) => {
    state.workflows[event.runId] = event;
  });
}
