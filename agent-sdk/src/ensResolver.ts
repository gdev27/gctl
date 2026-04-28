import { JsonRpcProvider } from "ethers";
import { EnsFundMetadata, EnsIdentityPassport, EnsResolver } from "./types";
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

  async getResolver(ensName: string) {
    return this.provider.getResolver(ensName);
  }

  async resolveFundMetadata(fundEnsName: string): Promise<EnsFundMetadata> {
    try {
      const resolver = await this.provider.getResolver(fundEnsName);
      if (!resolver) {
        throw new PolicyClientError("ENS_LOOKUP_FAILED", `No ENS resolver for ${fundEnsName}`);
      }
      const [policyIdRaw, policyRegistryAddressRaw, chainIdRawRaw, executionProfileRecord] = await Promise.all([
        resolver.getText("policy-id"),
        resolver.getText("policy-registry"),
        resolver.getText("policy-registry-chain-id"),
        resolver.getText("execution-profile")
      ]);
      const policyId = requireText(policyIdRaw, "policy-id");
      const policyRegistryAddress = requireText(policyRegistryAddressRaw, "policy-registry");
      const chainIdRaw = requireText(chainIdRawRaw, "policy-registry-chain-id");
      const executionProfileRaw = executionProfileRecord || "standard";
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

  async verifyAgentAuthorization(
    agentEnsName: string,
    existingResolver: Awaited<ReturnType<JsonRpcProvider["getResolver"]>> | null = null
  ): Promise<boolean> {
    try {
      const resolver = existingResolver || (await this.provider.getResolver(agentEnsName));
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

  async resolveIdentityPassport(
    agentEnsName: string,
    existingResolver: Awaited<ReturnType<JsonRpcProvider["getResolver"]>> | null = null
  ): Promise<EnsIdentityPassport> {
    try {
      const resolver = existingResolver || (await this.provider.getResolver(agentEnsName));
      if (!resolver) {
        throw new PolicyClientError("ENS_LOOKUP_FAILED", `No ENS resolver for ${agentEnsName}`);
      }

      const walletAddress = await this.provider.resolveName(agentEnsName);
      const reverseName = walletAddress ? await this.provider.lookupAddress(walletAddress) : null;
      const verifiedReverse = Boolean(reverseName && reverseName.toLowerCase() === agentEnsName.toLowerCase());

      const metadataKeys = ["agent-description", "agent-endpoint", "agent-version", "agent-policy-profile"];
      const [roleRecord, capabilitiesRecord, ...metadataValues] = await Promise.all([
        resolver.getText("agent-role"),
        resolver.getText("agent-capabilities"),
        ...metadataKeys.map((key) => resolver.getText(key))
      ]);
      const role = roleRecord || "executor";
      const capabilities = (capabilitiesRecord || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
      const metadataEntries = metadataKeys.map((key, index) => [key, metadataValues[index] || ""] as const);

      return {
        ensName: agentEnsName,
        walletAddress,
        resolverAddress: resolver.address,
        verifiedReverse,
        role,
        capabilities,
        metadata: Object.fromEntries(metadataEntries)
      };
    } catch (error) {
      if (error instanceof PolicyClientError) {
        throw error;
      }
      throw new PolicyClientError("ENS_LOOKUP_FAILED", String(error));
    }
  }
}
