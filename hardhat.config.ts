import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "";
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

const accounts = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
      chainId: 31337,
      forking: MAINNET_RPC_URL
        ? {
            url: MAINNET_RPC_URL
          }
        : undefined
    },
    baseSepolia: {
      type: "http",
      chainType: "l1",
      url: BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts
    }
  }
};

export default config;
