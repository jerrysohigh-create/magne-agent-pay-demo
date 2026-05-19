const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  console.log("\n=== Deploying MockMHA ===");
  const MockMHA = await hre.ethers.getContractFactory("MockMHA");
  const mockMHA = await MockMHA.deploy();
  await mockMHA.waitForDeployment();
  const mockMHAAddress = await mockMHA.getAddress();
  console.log("MockMHA deployed to:", mockMHAAddress);

  // Check faucet balance
  const faucetBalance = await mockMHA.balanceOf(mockMHAAddress);
  console.log("Faucet balance:", hre.ethers.formatEther(faucetBalance), "mMHA");

  console.log("\n=== Deploying AITaskReceipt ===");
  const AITaskReceipt = await hre.ethers.getContractFactory("AITaskReceipt");
  const aiTaskReceipt = await AITaskReceipt.deploy();
  await aiTaskReceipt.waitForDeployment();
  const aiTaskReceiptAddress = await aiTaskReceipt.getAddress();
  console.log("AITaskReceipt deployed to:", aiTaskReceiptAddress);

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("MOCK_MHA_ADDRESS=" + mockMHAAddress);
  console.log("AI_TASK_RECEIPT_ADDRESS=" + aiTaskReceiptAddress);
  console.log("CHAIN_ID=" + (await hre.ethers.provider.getNetwork()).chainId);

  // Save deployment addresses for frontend/backend reference
  const fs = require("fs");
  const deploymentInfo = {
    network: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
    contracts: {
      MockMHA: mockMHAAddress,
      AITaskReceipt: aiTaskReceiptAddress
    },
    deployer: deployer.address
  };
  fs.writeFileSync(
    "./deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to ./deployment-info.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
