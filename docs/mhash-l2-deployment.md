# M Hash L2 Deployment Guide

Instructions for deploying the MAGNE Agent Pay demo contracts to M Hash L2 Testnet.

## Prerequisites

1. **Wallet Setup**
   - MetaMask or EVM-compatible wallet
   - Testnet ETH for gas (M Hash L2 Testnet)
   - Add M Hash L2 Testnet to MetaMask

2. **Network Details**
   ```
   Network Name: M Hash L2 Testnet
   RPC URL: https://l2-rpc.testnet.magicalhash.com
   Chain ID: 20250827
   Explorer: https://l2-explorer.testnet.magicalhash.com
   Symbol: ETH
   ```

3. **Tools**
   - Node.js 18+
   - npm or yarn
   - Hardhat (or Remix IDE)

## Deployment Methods

### Option A: Hardhat (Recommended)

#### 1. Setup Project

```bash
cd magne-agent-pay-demo/contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

#### 2. Create `hardhat.config.js`

```javascript
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    mhashL2Testnet: {
      url: "https://l2-rpc.testnet.magicalhash.com",
      chainId: 20250827,
      accounts: [PRIVATE_KEY]
    }
  }
};
```

#### 3. Create Deployment Script `scripts/deploy.js`

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying to M Hash L2 Testnet...");
  
  // Deploy MockMHA
  const MockMHA = await hre.ethers.getContractFactory("MockMHA");
  const mockMHA = await MockMHA.deploy();
  await mockMHA.deployed();
  console.log("MockMHA deployed to:", mockMHA.address);

  // Deploy AITaskReceipt
  const AITaskReceipt = await hre.ethers.getContractFactory("AITaskReceipt");
  const aiTaskReceipt = await AITaskReceipt.deploy();
  await aiTaskReceipt.deployed();
  console.log("AITaskReceipt deployed to:", aiTaskReceipt.address);

  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("MOCK_MHA_ADDRESS=" + mockMHA.address);
  console.log("AI_TASK_RECEIPT_ADDRESS=" + aiTaskReceipt.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

#### 4. Deploy Contracts

```bash
# Set your private key (use environment variable)
export PRIVATE_KEY="0x_your_private_key_here"

# Deploy
npx hardhat run scripts/deploy.js --network mhashL2Testnet
```

#### 5. Verify Deployment

After deployment, you should see:
```
MockMHA deployed to: 0x... (save this)
AITaskReceipt deployed to: 0x... (save this)
```

### Option B: Remix IDE

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create new workspace
3. Create files:
   - `contracts/MockMHA.sol`
   - `contracts/AITaskReceipt.sol`
4. Compile both contracts
5. Deploy:
   - Environment: "Injected Provider - MetaMask"
   - Network: M Hash L2 Testnet
   - Deploy MockMHA first
   - Deploy AITaskReceipt second

## Post-Deployment Setup

### 1. Update Backend Configuration

Copy `.env.example` to `.env` and update:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
M_HASH_L2_RPC=https://l2-rpc.testnet.magicalhash.com
CHAIN_ID=20250827
MOCK_MHA_ADDRESS=0x... (from deployment)
AI_TASK_RECEIPT_ADDRESS=0x... (from deployment)
FACILITATOR_PRIVATE_KEY=0x... (your wallet private key)
FACILITATOR_ADDRESS=0x... (your wallet address)
```

### 2. Update Frontend Configuration

In `frontend/index.html`, update the default values or use the UI to set:
- RPC URL: `https://l2-rpc.testnet.magicalhash.com`
- Chain ID: `20250827`
- MockMHA Address: `0x...`
- AITaskReceipt Address: `0x...`

### 3. Fund the Facilitator

The facilitator wallet needs testnet ETH for:
- Gas for receipt transactions
- Any refund mechanisms

```javascript
// If MockMHA has a faucet, you can also fund addresses
await mockMHA.faucet(facilitatorAddress, ethers.utils.parseEther("100"));
```

## Testing Deployment

### 1. Verify Contract on Explorer

1. Go to `https://l2-explorer.testnet.magicalhash.com`
2. Search for your contract addresses
3. Verify:
   - Contract creation transaction exists
   - Contract is verified (if explorer supports)
   - Events can be viewed

### 2. Test MockMHA Token

```javascript
// Check balance
const balance = await mockMHA.balanceOf(walletAddress);
console.log("Balance:", ethers.utils.formatEther(balance), "mMHA");

// Check total supply
const supply = await mockMHA.totalSupply();
console.log("Total Supply:", ethers.utils.formatEther(supply), "mMHA");
```

### 3. Test AITaskReceipt Contract

```javascript
// Create a test receipt
const tx = await aiTaskReceipt.createReceipt(
  "test-task-001",
  walletAddress,
  walletAddress,
  "0x0000000000000000000000000000000000000000",
  "text-generation",
  ethers.utils.parseEther("0.01"),
  mockMHA.address,
  ethers.utils.keccak256(ethers.toUtf8Bytes("test")),
  ethers.utils.keccak256(ethers.toUtf8Bytes("result")),
  "ipfs://test"
);

const receipt = await tx.wait();
console.log("Receipt created!");

// Get receipt ID from event
for (const log of receipt.logs) {
  try {
    const parsed = aiTaskReceipt.interface.parseLog(log);
    if (parsed.name === "AITaskReceiptCreated") {
      console.log("Receipt ID:", parsed.args[0]);
    }
  } catch (e) {}
}
```

## Troubleshooting

### "Invalid Chain ID"
- Ensure MetaMask is connected to M Hash L2 Testnet (Chain ID: 20250827)
- Hardhat network config must match

### "Nonce too low"
- Reset MetaMask account nonce: Settings → Advanced → Reset Account
- Or wait for pending transactions to complete

### "Contract not found on explorer"
- Wait for indexing (may take a few blocks)
- Verify contract address is correct
- Check if explorer has indexed the block

### "Insufficient gas"
- Bridge ETH to M Hash L2 Testnet
- Check ETH balance of deploying wallet

## Security Notes (Testnet Demo)

⚠️ **For testnet demonstration only:**

1. **Private Keys**: Never commit `.env` files with real private keys
2. **Testnet Funds**: Only use testnet tokens with no real value
3. **No Mainnet**: This guide only covers testnet deployment
4. **Not Audited**: Contracts are for demonstration, not production use

## Next Steps

After successful deployment:

1. Update all configuration files with deployed addresses
2. Start backend server: `cd backend && npm start`
3. Open frontend: `frontend/index.html`
4. Run full demo flow

---

**Disclaimer**: This deployment guide is for testnet demonstration purposes only. Not for production use. Subject to technical validation.
