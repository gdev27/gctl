import hre from "hardhat";

async function main() {
  const hardhat = hre as unknown as {
    ethers: {
      getSigners: () => Promise<Array<{ address: string }>>;
      getContractFactory: (name: string) => Promise<{
        deploy: (...args: unknown[]) => Promise<{
          waitForDeployment: () => Promise<void>;
          getAddress: () => Promise<string>;
        }>;
      }>;
    };
  };
  const [deployer] = await hardhat.ethers.getSigners();
  const admin = process.env.ADMIN_ADDRESS || deployer.address;
  const policyAdmin = process.env.POLICY_ADMIN_ADDRESS || deployer.address;
  const guardian = process.env.GUARDIAN_ADDRESS || deployer.address;

  const Factory = await hardhat.ethers.getContractFactory("PolicyRegistry");
  const registry = await Factory.deploy(admin, policyAdmin, guardian);
  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log(
    JSON.stringify(
      {
        address,
        deployer: deployer.address,
        admin,
        policyAdmin,
        guardian
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
