import fs from "node:fs/promises";
import path from "node:path";
import { IndexState, initialIndexState } from "./schema";

const DB_PATH = path.resolve("./indexer/index-state.json");

let loaded = false;
let state: IndexState = {
  policies: {},
  workflows: {}
};
let mutationQueue: Promise<void> = Promise.resolve();

function cloneState(source: IndexState): IndexState {
  return {
    policies: { ...source.policies },
    workflows: { ...source.workflows }
  };
}

async function loadFromDisk(): Promise<void> {
  if (loaded) {
    return;
  }
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    state = JSON.parse(raw) as IndexState;
  } catch {
    state = cloneState(initialIndexState);
  }
  loaded = true;
}

async function persistToDisk(current: IndexState): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(current, null, 2), "utf8");
}

export async function initIndexedState(): Promise<void> {
  await loadFromDisk();
}

export async function getIndexedStateSnapshot(): Promise<IndexState> {
  await loadFromDisk();
  return cloneState(state);
}

export async function mutateIndexedState(mutator: (draft: IndexState) => void | Promise<void>): Promise<void> {
  mutationQueue = mutationQueue.then(async () => {
    await loadFromDisk();
    await mutator(state);
    await persistToDisk(state);
  });
  return mutationQueue;
}
