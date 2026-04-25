import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

async function expectRevert(fn) {
  let reverted = false;
  try {
    await fn();
  } catch {
    reverted = true;
  }
  expect(reverted).to.equal(true);
}

describe("PolicyRegistry", () => {
  async function deployFixture() {
    const [deployer, policyAdmin, guardian, outsider, newAdmin] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("PolicyRegistry");
    const registry = await factory.deploy(deployer.address, policyAdmin.address, guardian.address);
    await registry.waitForDeployment();
    return { registry, deployer, policyAdmin, guardian, outsider, newAdmin };
  }

  it("only policy admins can register policy", async () => {
    const { registry, policyAdmin, outsider } = await deployFixture();
    const policyId = ethers.keccak256(ethers.toUtf8Bytes("p1"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("h1"));
    await expectRevert(() => registry.connect(outsider).registerPolicy(policyId, hash, "file://x"));
    await registry.connect(policyAdmin).registerPolicy(policyId, hash, "file://x");
  });

  it("supports multisig-style handover by granting and revoking admin role", async () => {
    const { registry, deployer, newAdmin } = await deployFixture();
    const defaultAdminRole = await registry.DEFAULT_ADMIN_ROLE();
    await registry.connect(deployer).grantRole(defaultAdminRole, newAdmin.address);
    await registry.connect(deployer).revokeRole(defaultAdminRole, deployer.address);
    await expectRevert(() => registry.connect(deployer).grantRole(defaultAdminRole, deployer.address));
    await registry.connect(newAdmin).grantRole(defaultAdminRole, deployer.address);
  });

  it("guardian can pause and admin can unpause", async () => {
    const { registry, deployer, policyAdmin, guardian, outsider } = await deployFixture();
    const policyId = ethers.keccak256(ethers.toUtf8Bytes("p2"));
    const hash = ethers.keccak256(ethers.toUtf8Bytes("h2"));
    await expectRevert(() => registry.connect(outsider).pause());
    await registry.connect(guardian).pause();
    await expectRevert(() => registry.connect(policyAdmin).registerPolicy(policyId, hash, "file://y"));
    await expectRevert(() => registry.connect(guardian).unpause());
    await registry.connect(deployer).unpause();
    await registry.connect(policyAdmin).registerPolicy(policyId, hash, "file://y");
  });
});
