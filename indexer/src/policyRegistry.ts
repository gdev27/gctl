import { IndexState } from "./schema";
import { getIndexedStateSnapshot, mutateIndexedState } from "./stateStore";

export async function indexPolicyRegistered(event: {
  policyId: string;
  hash: string;
  uri: string;
  active: boolean;
  updatedAt: number;
}): Promise<void> {
  await mutateIndexedState((state) => {
    state.policies[event.policyId] = {
      policyId: event.policyId,
      hash: event.hash,
      uri: event.uri,
      active: event.active,
      updatedAt: event.updatedAt
    };
  });
}

export async function getIndexedState(): Promise<IndexState> {
  return getIndexedStateSnapshot();
}
