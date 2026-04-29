import express, { Request, Response } from "express";
import { getIndexedStateSnapshot, initIndexedState } from "./stateStore";

const app = express();
app.use(express.json());

app.get("/fund/:ens/policies", async (_req: Request, res: Response) => {
  const state = await getIndexedStateSnapshot();
  res.json(Object.values(state.policies));
});

app.get("/workflows", async (_req: Request, res: Response) => {
  const state = await getIndexedStateSnapshot();
  res.json(Object.values(state.workflows));
});

app.get("/workflows/:id", async (req: Request, res: Response) => {
  const state = await getIndexedStateSnapshot();
  const workflowOrRunId = String(req.params.id);
  const directMatch = state.workflows[workflowOrRunId];
  const workflow = directMatch || Object.values(state.workflows).find((entry) => entry.workflowId === workflowOrRunId);
  if (!workflow) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(workflow);
});

app.get("/runs/:runId", async (req: Request, res: Response) => {
  const state = await getIndexedStateSnapshot();
  const runId = String(req.params.runId);
  const workflow = state.workflows[runId];
  if (!workflow) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(workflow);
});

app.get("/alerts/fail-closed", async (_req: Request, res: Response) => {
  const state = await getIndexedStateSnapshot();
  const alerts = Object.values(state.workflows).filter(
    (entry) => entry.state === "reverted" || entry.state === "timed_out" || entry.state === "denied"
  );
  res.json(alerts);
});

const port = Number(process.env.INDEXER_PORT || 4300);

void initIndexedState().then(() => {
  app.listen(port, () => {
    console.log(`Indexer API listening on ${port}`);
  });
}).catch((error) => {
  console.error("Failed to initialize indexed state", error);
  process.exit(1);
});
