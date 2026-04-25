import express, { Request, Response } from "express";
import { getIndexedState } from "./policyRegistry";

const app = express();
app.use(express.json());

app.get("/fund/:ens/policies", async (_req: Request, res: Response) => {
  const state = await getIndexedState();
  res.json(Object.values(state.policies));
});

app.get("/workflows/:id", async (req: Request, res: Response) => {
  const state = await getIndexedState();
  const workflowId = String(req.params.id);
  const workflow = state.workflows[workflowId];
  if (!workflow) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(workflow);
});

app.get("/alerts/fail-closed", async (_req: Request, res: Response) => {
  const state = await getIndexedState();
  const alerts = Object.values(state.workflows).filter((entry) => entry.state === "reverted" || entry.state === "timed_out");
  res.json(alerts);
});

const port = Number(process.env.INDEXER_PORT || 4300);
app.listen(port, () => {
  console.log(`Indexer API listening on ${port}`);
});
