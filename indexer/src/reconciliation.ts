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

export async function indexWorkflowOutcome(event: {
  runId: string;
  workflowId: string;
  policyId: string;
  state: string;
  auditPath: string;
  updatedAt: number;
}): Promise<void> {
  const state = await loadState();
  state.workflows[event.runId] = event;
  await saveState(state);
}
