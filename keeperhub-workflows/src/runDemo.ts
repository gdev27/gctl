import { createHash } from "node:crypto";
import { Wallet } from "ethers";
import { ActionRequest } from "../../policy-engine/src/types";
import { PolicyClient } from "../../agent-sdk/src/client";
import { buildStorageAdapter } from "../../policy-engine/src/storageAdapter";
import { buildWorkflowFromPlan } from "./buildFromPlan";
import { HttpKeeperHubClient } from "./client";
import { MockKeeperHubClient } from "./client.mock";
import { reconcileWorkflow } from "./reconcile";
import { indexWorkflowOutcome } from "../../indexer/src/reconciliation";
import { ZeroGChainAdapter, ZeroGComputeAdapter, ZeroGMemoryAdapter } from "../../agent-sdk/src/zeroG";

export async function runPolicyAndWorkflow(input: {
  fundEnsName: string;
  callerEnsName?: string;
  action: ActionRequest;
}): Promise<Record<string, unknown>> {
  const computeAdapter = new ZeroGComputeAdapter();
  const memoryAdapter = new ZeroGMemoryAdapter();
  const chainAdapter = new ZeroGChainAdapter();

  const preflight = await computeAdapter.infer({
    role: "planner",
    objective: "Assess execution risk and preferred route for this action",
    context: {
      fundEnsName: input.fundEnsName,
      callerEnsName: input.callerEnsName || null,
      action: input.action
    }
  });

  const preflightMemory = await memoryAdapter.write({
    namespace: "policy-preflight",
    key: preflight.requestId,
    payload: {
      fundEnsName: input.fundEnsName,
      callerEnsName: input.callerEnsName || null,
      action: input.action,
      inference: preflight
    },
    encrypted: true,
    createdAt: new Date().toISOString()
  });

  const intentMessage = PolicyClient.buildIntentMessage({
    fundEnsName: input.fundEnsName,
    action: input.action
  });
  const maybeIntentSigner = process.env.AGENT_PRIVATE_KEY ? new Wallet(process.env.AGENT_PRIVATE_KEY) : null;
  const intentProof = maybeIntentSigner
    ? {
        message: intentMessage,
        signature: await maybeIntentSigner.signMessage(intentMessage),
        signerAddress: maybeIntentSigner.address
      }
    : undefined;

  const storage = buildStorageAdapter();
  const client = new PolicyClient({
    ensMainnetRpcUrl: process.env.ENS_MAINNET_RPC_URL || process.env.MAINNET_RPC_URL || "",
    l2RegistryRpcUrl: process.env.BASE_SEPOLIA_RPC_URL || "",
    storage,
    expectedRegistryChainId: Number(process.env.POLICY_REGISTRY_CHAIN_ID || 84532),
    timeoutMs: Number(process.env.POLICY_CLIENT_TIMEOUT_MS || 5_000),
    maxRetries: Number(process.env.POLICY_CLIENT_MAX_RETRIES || process.env.POLICY_CLIENT_RETRY_COUNT || 1),
    agentRegistryAddress: process.env.ERC8004_REGISTRY_ADDRESS
  });

  const planned = await client.planAction({
    fundEnsName: input.fundEnsName,
    callerEnsName: input.callerEnsName,
    action: input.action,
    intentProof
  });

  if (!planned.plan.allowed || !planned.policyId) {
    return planned;
  }

  const workflow = buildWorkflowFromPlan(planned.plan, {
    policyId: planned.policyId,
    action: input.action
  });

  const keeperClient =
    process.env.KEEPERHUB_USE_MOCK === "true" || !process.env.KEEPERHUB_API_URL || !process.env.KEEPERHUB_API_KEY
      ? new MockKeeperHubClient({
          terminalState: (process.env.KEEPERHUB_MOCK_FINAL_STATE as
            | "succeeded"
            | "reverted"
            | "partial_fill"
            | "timed_out"
            | "cancelled"
            | undefined) || "succeeded"
        })
      : new HttpKeeperHubClient(process.env.KEEPERHUB_API_URL, process.env.KEEPERHUB_API_KEY);

  try {
    const { workflowId } = await keeperClient.createWorkflow(workflow);
    const { runId } = await keeperClient.runWorkflow(workflowId);
    const requestFingerprint = createHash("sha256")
      .update(JSON.stringify({ policyId: planned.policyId, action: input.action }))
      .digest("hex");
    const reconciled = await reconcileWorkflow(keeperClient, {
      policyId: planned.policyId,
      workflowId,
      runId,
      requestFingerprint,
      executionPlan: planned.plan
    });

    await indexWorkflowOutcome({
      runId,
      workflowId,
      policyId: planned.policyId,
      state: reconciled.state,
      auditPath: reconciled.auditPath,
      updatedAt: Date.now()
    });

    const executionMemory = await memoryAdapter.write({
      namespace: "execution-outcomes",
      key: runId,
      payload: {
        policyId: planned.policyId,
        workflowId,
        runId,
        state: reconciled.state,
        plan: planned.plan
      },
      encrypted: true,
      createdAt: new Date().toISOString()
    });

    const attestation = await chainAdapter.anchorAttestation({
      policyId: planned.policyId,
      action: input.action,
      plan: planned.plan,
      executionRef: runId,
      artifactHash: executionMemory.hash
    });

    return {
      ...planned,
      computePreflight: {
        provider: preflight.provider,
        model: preflight.model,
        requestId: preflight.requestId,
        verified: preflight.verified
      },
      memoryArtifacts: {
        preflight: preflightMemory,
        execution: executionMemory
      },
      chainAttestation: attestation,
      intentProofIncluded: Boolean(intentProof),
      workflowId,
      runId,
      reconciliationState: reconciled.state,
      auditPath: reconciled.auditPath,
      runLogCount: reconciled.logCount,
      reliabilityAnalytics: reconciled.analytics
    };
  } catch (error) {
    return {
      policyId: planned.policyId,
      metadata: planned.metadata,
      plan: {
        allowed: false,
        reason: "dependency_failure",
        errorCode: `KEEPERHUB_EXECUTION_FAILED:${String(error)}`
      }
    };
  }
}
