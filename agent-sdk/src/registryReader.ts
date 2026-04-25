import { Contract, Provider } from "ethers";
import { PolicyRegistryReader } from "./types";
import { PolicyClientError } from "./errors";

const registryAbi = [
  "function policies(bytes32 policyId) view returns (bytes32 hash, string uri, bool active, uint256 updatedAt)"
];

export class EvmPolicyRegistryReader implements PolicyRegistryReader {
  private readonly contract: Contract;

  constructor(registryAddress: string, provider: Provider) {
    this.contract = new Contract(registryAddress, registryAbi, provider);
  }

  async getPolicyMeta(policyId: string): Promise<{ hash: string; uri: string; active: boolean }> {
    try {
      const [hash, uri, active] = await this.contract.policies(policyId);
      if (!hash || hash === "0x0000000000000000000000000000000000000000000000000000000000000000") {
        throw new PolicyClientError("REGISTRY_READ_FAILED", "Policy hash not found in registry");
      }
      return { hash, uri, active };
    } catch (error) {
      if (error instanceof PolicyClientError) {
        throw error;
      }
      throw new PolicyClientError("REGISTRY_READ_FAILED", String(error));
    }
  }
}
