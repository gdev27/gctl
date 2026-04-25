import fs from "node:fs/promises";
import path from "node:path";
import { IndexState, initialIndexState } from "./schema";

const DB_PATH = path.resolve("./indexer/index-state.json");

async function loadState(): Promise<IndexState> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as IndexState;
  } catch {
    return initialIndexState;
  }
}

async function saveState(state: IndexState): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(state, null, 2), "utf8");
}

export async function indexPolicyRegistered(event: {
  policyId: string;
  hash: string;
  uri: string;
  active: boolean;
  updatedAt: number;
}): Promise<void> {
  const state = await loadState();
  state.policies[event.policyId] = {
    policyId: event.policyId,
    hash: event.hash,
    uri: event.uri,
    active: event.active,
    updatedAt: event.updatedAt
  };
  await saveState(state);
}

export async function getIndexedState(): Promise<IndexState> {
  return loadState();
}
