import { JsonRpcProvider } from "ethers";
import { EnsFundMetadata, EnsResolver } from "./types";
import { PolicyClientError } from "./errors";

function requireText(text: string | null, key: string): string {
  if (!text || !text.trim()) {
    throw new PolicyClientError("ENS_RECORD_MALFORMED", `Missing ENS text record: ${key}`);
  }
  return text;
}

export class MainnetEnsResolver implements EnsResolver {
  constructor(
    private readonly provider: JsonRpcProvider,
    private readonly agentRegistryAddress?: string
  ) {}

  async resolveFundMetadata(fundEnsName: string): Promise<EnsFundMetadata> {
    try {
      const resolver = await this.provider.getResolver(fundEnsName);
      if (!resolver) {
        throw new PolicyClientError("ENS_LOOKUP_FAILED", `No ENS resolver for ${fundEnsName}`);
      }
      const policyId = requireText(await resolver.getText("policy-id"), "policy-id");
      const policyRegistryAddress = requireText(await resolver.getText("policy-registry"), "policy-registry");
      const chainIdRaw = requireText(await resolver.getText("policy-registry-chain-id"), "policy-registry-chain-id");
      const executionProfileRaw = (await resolver.getText("execution-profile")) || "standard";
      const executionProfile =
        executionProfileRaw === "private-only" || executionProfileRaw === "standard" ? executionProfileRaw : "standard";
      const policyRegistryChainId = Number(chainIdRaw);
      if (!Number.isFinite(policyRegistryChainId)) {
        throw new PolicyClientError("ENS_RECORD_MALFORMED", "policy-registry-chain-id is not numeric");
      }

      return {
        policyId,
        policyRegistryAddress,
        policyRegistryChainId,
        executionProfile
      };
    } catch (error) {
      if (error instanceof PolicyClientError) {
        throw error;
      }
      throw new PolicyClientError("ENS_LOOKUP_FAILED", String(error));
    }
  }

  async verifyAgentAuthorization(agentEnsName: string): Promise<boolean> {
    try {
      const resolver = await this.provider.getResolver(agentEnsName);
      if (!resolver) {
        return false;
      }

      const registrySegment = this.agentRegistryAddress || "erc8004";
      const key = `agent-registration[${registrySegment}][agentId]`;
      const value = await resolver.getText(key);
      return Boolean(value && value.trim().length > 0);
    } catch {
      return false;
    }
  }
}
