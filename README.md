# 🔮 MAGNE Agent Pay Demo

> x402-Compatible AI Task Payment and AI Task Receipt Flow on M Hash L2 Testnet

![Version](https://img.shields.io/badge/version-0.1.0--testnet-blue)
![Status](https://img.shields.io/badge/status-testnet--stage-orange)
![Chain ID](https://img.shields.io/badge/chain--id-20250827-8B5CF6)

## ⚠️ Important Disclaimer

**This is a testnet-stage developer demonstration only.**

- ❌ Not production-ready
- ❌ Do not promise any returns
- ❌ Do not imply MHA token appreciation
- ❌ This is not a production payment integration. It is a testnet-stage developer demonstration designed for technical review, architecture validation, and ecosystem discussion.

**Planned / Designed to support / Subject to technical validation**

---

## Runnable Status

> V0.1 Runnable Demo — ✅ Runtime Verified (local Hardhat)

| Check | Status | Details |
|-------|--------|---------|
| Smart contracts compile | ✅ Verified | `npx hardhat compile` → "Compiled 2 Solidity files successfully" |
| Smart contracts deploy | ✅ Verified | MockMHA: `0x5FbDB2315678afecb367f032d93F642f64180aa3` / AITaskReceipt: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| Backend starts | ✅ Verified | `node server.js` → http://127.0.0.1:3000/health OK |
| mMHA ERC20 payment | ✅ Verified | tx: `0x130ba003e19e8a6edc2a7ae6147e1f7ff9411cb78b0dc875b9d5084df4b4701e` Block 4 |
| Facilitator verify | ✅ Verified | status: verified (strict token transfer check) |
| Receipt transaction created | ✅ Verified | tx: `0x7d423e93ed4ecd7b488394a71a9c711f8b30b7b1515e34a537030abce785a705` |
| Explorer link | ⚠️ Local only | Uses local Hardhat node (http://127.0.0.1:8545); M Hash L2 testnet explorer pending network access |

**Runtime Environment:** local Hardhat (chainId: 31337)
**Testnet Deployment:** Pending M Hash L2 RPC access

---

## Overview

MAGNE Agent Pay V0.1 Demo showcases an x402-compatible payment flow for AI agent task settlements on M Hash L2 Testnet.

**Key architectural point**: This demo operates as a standard EVM contract layer on top of M Hash L2 — no modifications to M Hash L2 core code or OP Stack deployment logic.

### Key Features

- 🔗 **x402-Compatible** — HTTP 402 payment requests with structured metadata
- 🤖 **AI Task Receipts** — On-chain recording via `AITaskReceipt.createReceipt()`
- ⚡ **M Hash L2** — High-performance EVM layer 2 (400ms blocks, <$0.0025 fees target)
- 💳 **ERC20 Payment** — Uses MockMHA (mMHA) token, not native ETH
- 📜 **Full Audit Trail** — Verifiable receipts on-chain with strict transfer verification

---

## Project Structure

```
magne-agent-pay-demo/
├── contracts/
│   ├── package.json           # Hardhat + compile scripts
│   ├── hardhat.config.js      # Network config
│   ├── scripts/deploy.js      # Deployment script
│   ├── MockMHA.sol            # ERC20 mock token (mMHA)
│   └── AITaskReceipt.sol      # AI task receipt contract
├── backend/
│   ├── package.json
│   ├── server.js              # Express.js server
│   ├── paidApi.js             # x402-compatible payment API
│   ├── facilitator.js          # Strict token transfer verification + receipt
│   └── .env.example
├── frontend/
│   ├── index.html             # Demo UI (4-step flow)
│   ├── app.js                 # ERC20 payment via MockMHA.transfer()
│   └── style.css              # Dark tech theme
└── docs/
    ├── architecture.md         # System architecture
    ├── demo-flow.md           # Step-by-step demo guide
    ├── mhash-l2-deployment.md  # Contract deployment guide
    └── exchange-demo-script.md # External presentation script
```

---

## Quick Start

### 1. Deploy Contracts

```bash
cd contracts
npm install
export PRIVATE_KEY=0x_your_private_key
export M_HASH_L2_RPC=https://testnet-rpc.mhash.ai
export CHAIN_ID=20250827
npx hardhat run scripts/deploy.js --network mhashL2Testnet
```

Output:
```
MockMHA deployed to: 0x...
AITaskReceipt deployed to: 0x...
MOCK_MHA_ADDRESS=0x...
AI_TASK_RECEIPT_ADDRESS=0x...
```

### 2. Configure and Start Backend

```bash
cd ../backend
cp .env.example .env
# Edit .env with:
#   MOCK_MHA_ADDRESS=<from deployment>
#   AI_TASK_RECEIPT_ADDRESS=<from deployment>
#   FACILITATOR_PRIVATE_KEY=<your private key>
#   FACILITATOR_ADDRESS=<your wallet address>
npm install
npm start
```

### 3. Open Frontend

```bash
# Either open frontend/index.html directly, or:
npx serve frontend
# Then visit http://localhost:3000
```

### 4. Configure Frontend UI

In the frontend UI, set:
- RPC URL: `https://testnet-rpc.mhash.ai`
- Chain ID: `20250827`
- MockMHA Address: `<MOCK_MHA_ADDRESS from deployment>`
- AITaskReceipt Address: `<AI_TASK_RECEIPT_ADDRESS from deployment>`

### 5. Run Demo Flow

1. **Connect Wallet** — Click "Connect Wallet" and approve MetaMask
2. **Create Task** — Select service type, click "Create Task" → returns HTTP 402 with payment info
3. **Initiate Payment** — Click "Initiate Payment" → MetaMask prompts for mMHA ERC20 transfer
4. **Verify Payment** — Backend verifies strict: contract address + recipient + amount
5. **Generate Receipt** — Backend calls `AITaskReceipt.createReceipt()` on-chain

---

## Demo Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Step 1     │     │  Step 2     │     │  Step 3     │     │  Step 4     │
│  AI Agent   │────▶│  HTTP 402   │────▶│  Payment    │────▶│  AI Task    │
│  Task       │     │  Required   │     │  Settlement │     │  Receipt    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                   │                    │                    │
  POST /agent/task   402 with           MetaMask signs          On-chain
  + payment info     mMHA ERC20          strict verify()       createReceipt()
```

---

## Payment Verification (Strict)

The facilitator performs strict on-chain verification:

1. ✅ Transaction receipt exists and status === 1
2. ✅ Chain ID matches expected network
3. ✅ Log address matches `MOCK_MHA_ADDRESS`
4. ✅ Transfer event `to` address matches `expectedRecipient`
5. ✅ Transfer event `value` >= `expectedAmount`

If any check fails → `status: "failed"` with reason.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agent/task` | POST | Create AI task → returns HTTP 402 with x402 payment metadata |
| `/paid-api/wallet-risk` | GET | Check payment status for a task |
| `/facilitator/verify` | POST | **Strict** on-chain mMHA transfer verification |
| `/facilitator/receipt` | POST | Call `AITaskReceipt.createReceipt()` on-chain |
| `/facilitator/status` | GET | Check facilitator + network status |

---

## Smart Contracts

### MockMHA (mMHA)

ERC20-like mock token for testnet demonstrations.

- Symbol: mMHA
- Decimals: 18
- Initial Supply: 1B (80% deployer, 20% faucet)
- Faucet function for distributing test tokens
- **Payment**: User calls `transfer(recipient, amount)` — not native ETH

### AITaskReceipt

Records AI task payment receipts on-chain.

```solidity
function createReceipt(
    string memory _taskId,
    address _user,
    address _provider,
    address _agent,
    string memory _serviceType,
    uint256 _amount,
    address _token,
    bytes32 _paymentTxHash,
    bytes32 _resultHash,
    string memory _metadataURI
) external returns (bytes32 receiptId);
```

Emits `AITaskReceiptCreated(receiptId, taskId, user, provider, agent, serviceType, amount, token, paymentTxHash, resultHash, metadataURI, timestamp)`.

---

## Network Configuration

| Parameter | Value |
|-----------|-------|
| Network Name | M Hash L2 Testnet |
| Chain ID | `20250827` (verify with official network config) |
| RPC URL | `https://testnet-rpc.mhash.ai` |
| Block Explorer | `https://testnet-explorer.mhash.ai` |
| Target Block Time | ~400ms |
| Target Gas Fee | <$0.0025 |

> ⚠️ **Chain ID Note**: Demo is configured for `20250827`. Current Kurtosis config may use `2151908`. Always verify the active chainId before demonstrations.

---

## Documentation

- [Architecture](docs/architecture.md) — System architecture and module descriptions
- [Demo Flow](docs/demo-flow.md) — Step-by-step demonstration guide
- [Deployment Guide](docs/mhash-l2-deployment.md) — Contract deployment instructions
- [Exchange Demo Script](docs/exchange-demo-script.md) — External presentation script
- [M-Hash-L2 Link](https://github.com/jerrysohigh-create/M-Hash-L2/blob/main/docs/agent-pay-demo.md) — Agent Pay Demo in M-Hash-L2 docs

---

## Compliance

- ✅ Testnet-only demonstration
- ✅ No investment promises
- ✅ No token sale
- ✅ Clear "subject to validation" language
- ✅ Designed for technical review and architecture validation

---

## Development Status

| Component | Status |
|-----------|--------|
| Smart Contracts (compile) | ✅ Verified (Hardhat 0.8.20, paris evm) |
| Smart Contracts (deploy) | ✅ Verified local Hardhat; ⏳ M Hash L2 testnet pending |
| Backend API | ✅ Runtime verified |
| Frontend Demo | ✅ UI served at http://127.0.0.1:8080; ⏳ MetaMask browser flow pending |
| End-to-end verification | ✅ Verified (local Hardhat) |
| Mainnet Deployment | ⏳ Planned |
| Production Ready | ❌ Not Ready |

---

## License

MIT — For testnet demonstration purposes only.

---

## Contact

For technical questions about the demo or collaboration inquiries, please reach out to the development team.

**Reminder**: This is a testnet developer demonstration. Do your own research. Not financial advice.
