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
- ❌ Not suitable for exchange integration at this stage

**Planned / Designed to support / Subject to technical validation**

---

## Overview

MAGNE Agent Pay V0.1 Demo showcases an x402-compatible payment flow for AI agent task settlements on M Hash L2 Testnet.

### Key Features

- 🔗 **x402-Compatible** — HTTP 402 payment requests with structured metadata
- 🤖 **AI Task Receipts** — On-chain recording of AI task payments
- ⚡ **M Hash L2** — High-performance EVM layer 2 (400ms blocks, <$0.0025 fees target)
- 💳 **EVM Wallets** — MetaMask and compatible wallets
- 📜 **Full Audit Trail** — Verifiable receipts on-chain

---

## Project Structure

```
magne-agent-pay-demo/
├── contracts/
│   ├── MockMHA.sol          # ERC20-like mock token (testnet only)
│   └── AITaskReceipt.sol    # AI task receipt contract
├── backend/
│   ├── server.js            # Express.js server
│   ├── paidApi.js            # x402-compatible payment API
│   ├── facilitator.js        # Payment verification & receipt generation
│   └── .env.example          # Environment template
├── frontend/
│   ├── index.html            # Demo UI
│   ├── app.js                # Frontend logic
│   └── style.css             # Dark tech theme
└── docs/
    ├── architecture.md       # System architecture
    ├── demo-flow.md          # Step-by-step demo guide
    ├── mhash-l2-deployment.md # Contract deployment guide
    └── exchange-demo-script.md # External presentation script
```

---

## Quick Start

### 1. Setup Network

Add M Hash L2 Testnet to MetaMask:
```
Network Name: M Hash L2 Testnet
RPC URL: https://testnet-rpc.mhash.ai
Chain ID: 20250827
Explorer: https://testnet-explorer.mhash.ai
Symbol: ETH
```

### 2. Deploy Contracts

See [docs/mhash-l2-deployment.md](docs/mhash-l2-deployment.md) for detailed deployment instructions.

```bash
cd contracts
npm install
npx hardhat run scripts/deploy.js --network mhashL2Testnet
```

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your deployed contract addresses
npm install
npm start
```

### 4. Open Frontend

Simply open `frontend/index.html` in a browser, or serve it:

```bash
npx serve frontend
```

---

## Demo Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Step 1     │     │  Step 2     │     │  Step 3     │     │  Step 4     │
│  AI Agent   │────▶│  402        │────▶│  Payment    │────▶│  AI Task    │
│  Task       │     │  Required   │     │  Settlement │     │  Receipt    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
     │                   │                    │                    │
  Create task        Pay with          Verify on-chain        Generate
  (HTTP 402)        MetaMask             tx hash            on-chain receipt
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agent/task` | POST | Create AI task, returns 402 payment required |
| `/paid-api/wallet-risk` | GET | Check payment status for a task |
| `/facilitator/verify` | POST | Verify payment transaction on-chain |
| `/facilitator/receipt` | POST | Generate AI task receipt on-chain |
| `/facilitator/status` | GET | Check facilitator service status |

---

## Smart Contracts

### MockMHA (mMHA)

ERC20-like mock token for testnet demonstrations.

- Symbol: mMHA
- Decimals: 18
- Initial Supply: 1B tokens
- Includes faucet function for testing

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

Emits `AITaskReceiptCreated` event with full receipt data.

---

## Network Details

| Parameter | Value |
|-----------|-------|
| Network Name | M Hash L2 Testnet |
| Chain ID | 20250827 |
| RPC URL | https://testnet-rpc.mhash.ai |
| Block Explorer | https://testnet-explorer.mhash.ai |
| Target Block Time | ~400ms |
| Target Gas Fee | <$0.0025 |

**Note**: Network parameters are design targets for testnet. Subject to technical validation.

---

## Documentation

- [Architecture](docs/architecture.md) — System architecture and module descriptions
- [Demo Flow](docs/demo-flow.md) — Step-by-step demonstration guide
- [Deployment Guide](docs/mhash-l2-deployment.md) — Contract deployment instructions
- [Exchange Demo Script](docs/exchange-demo-script.md) — External presentation script

---

## Compliance

- ✅ Testnet-only demonstration
- ✅ No investment promises
- ✅ No token sale
- ✅ Clear "subject to validation" language
- ✅ Designed for developer evaluation

---

## Development Status

| Component | Status |
|-----------|--------|
| Smart Contracts | ✅ Testnet Demo |
| Backend API | ✅ Testnet Demo |
| Frontend Demo | ✅ Testnet Demo |
| Mainnet Deployment | ⏳ Planned |
| Production Ready | ❌ Not Ready |

---

## License

MIT — For testnet demonstration purposes only.

---

## Contact

For technical questions about the demo or collaboration inquiries, please reach out to the development team.

**Reminder**: This is a testnet developer demonstration. Do your own research. Not financial advice.
