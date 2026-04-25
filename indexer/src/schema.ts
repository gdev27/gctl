export type IndexedPolicy = {
  policyId: string;
  hash: string;
  uri: string;
  active: boolean;
  updatedAt: number;
};

export type IndexedWorkflow = {
  runId: string;
  workflowId: string;
  policyId: string;
  state: string;
  auditPath: string;
  updatedAt: number;
};

export type IndexState = {
  policies: Record<string, IndexedPolicy>;
  workflows: Record<string, IndexedWorkflow>;
};

export const initialIndexState: IndexState = {
  policies: {},
  workflows: {}
};
