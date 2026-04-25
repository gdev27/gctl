import { JsonRpcProvider, Wallet } from "ethers";
import { PolicyClientSignerConfig } from "./types";

export type RotatableSigner = {
  signer: Wallet;
  config: PolicyClientSignerConfig;
  rotate: (newPrivateKey: string, newVersion: string) => RotatableSigner;
};

export function buildEnvSigner(rpcUrl: string): RotatableSigner {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("AGENT_PRIVATE_KEY is required for env-private-key mode");
  }
  const version = process.env.AGENT_KEY_VERSION || "v1";
  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);

  return {
    signer,
    config: {
      mode: "env-private-key",
      keyRef: signer.address,
      version
    },
    rotate: (newPrivateKey: string, newVersion: string) => {
      process.env.AGENT_PRIVATE_KEY = newPrivateKey;
      process.env.AGENT_KEY_VERSION = newVersion;
      return {
        signer: new Wallet(newPrivateKey, provider),
        config: {
          mode: "env-private-key",
          keyRef: signer.address,
          version: newVersion
        },
        rotate: (_key: string, _ver: string) => {
          throw new Error("Use buildEnvSigner to rehydrate after rotation.");
        }
      };
    }
  };
}
