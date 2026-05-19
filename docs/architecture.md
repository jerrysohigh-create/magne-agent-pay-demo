# MAGNE Agent Pay - Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MAGNE AGENT PAY V0.1 DEMO                          │
│                        x402-Compatible AI Task Payment                       │
│                          M Hash L2 Testnet (ChainID: 20250827)               │
└─────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────┐
                                    │   USER      │
                                    │  (Wallet)   │
                                    └──────┬──────┘
                                           │
                                           │ 1. Create Task
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    AI Agent Task Flow Demo UI                        │    │
│  │                                                                      │    │
│  │   [Step 1]          [Step 2]           [Step 3]          [Step 4]    │    │
│  │  AI Task    →   402 Required   →   Settlement   →   Receipt       │    │
│  │                                                                      │    │
│  │  MetaMask / EVM Compatible Wallet Connection                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           │ HTTP 402 + Payment Details
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                         │
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐      │
│   │  /agent/task │    │/paid-api/    │    │   /facilitator/          │      │
│   │  POST        │    │wallet-risk   │    │   - verify (POST)        │      │
│   │              │    │ GET           │    │   - receipt (POST)       │      │
│   │  Returns     │    │              │    │                          │      │
│   │  402 + x402  │    │ Returns      │    │  On-chain verification   │      │
│   │  compatible  │    │ 402 with      │    │  + Receipt creation     │      │
│   │  payment info │    │ payment info  │    │                          │      │
│   └──────────────┘    └──────────────┘    └──────────────────────────┘      │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     In-Memory Task Store (Demo)                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           │ Transaction Hash Verification
                                           │ + createReceipt() call
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           M HASH L2 TESTNET                                  │
│                         (ChainID: 20250827)                                  │
│                                                                              │
│   ┌──────────────────────┐         ┌──────────────────────────────────┐    │
│   │    MockMHA           │         │      AITaskReceipt                │    │
│   │    (mMHA)            │         │                                  │    │
│   │                      │         │  createReceipt()                 │    │
│   │  - ERC20 Mock Token  │         │    ↓                             │    │
│   │  - Faucet function   │         │  AITaskReceiptCreated Event       │    │
│   │  - For testnet demo  │         │    (receiptId, taskId, amount,    │    │
│   │                      │         │     user, provider, agent...)     │    │
│   └──────────────────────┘         └──────────────────────────────────┘    │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Explorer: https://testnet-explorer.mhash.ai                        │   │
│   │  RPC: https://testnet-rpc.mhash.ai                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Module Descriptions

### Frontend (`frontend/`)
- **index.html** - Main demo interface with 4-step flow visualization
- **app.js** - Wallet connection, task creation, payment, and receipt flow
- **style.css** - Dark tech theme with x402 payment flow UI

### Backend (`backend/`)
- **server.js** - Express.js server with CORS and route mounting
- **paidApi.js** - x402-compatible payment API (`/agent/task`, `/paid-api/wallet-risk`)
- **facilitator.js** - Payment verification and receipt generation (`/facilitator/verify`, `/facilitator/receipt`)
- **.env.example** - Environment variable template

### Smart Contracts (`contracts/`)
- **MockMHA.sol** - ERC20-like mock token for testnet demonstrations
- **AITaskReceipt.sol** - Records AI task receipts on-chain

### Documentation (`docs/`)
- **architecture.md** - This file
- **demo-flow.md** - Step-by-step demo instructions
- **mhash-l2-deployment.md** - Contract deployment guide
- **exchange-demo-script.md** - External presentation script

## Payment Flow (x402-Compatible)

```
User                    Backend                      Blockchain
 │                         │                              │
 │──POST /agent/task──────▶│                              │
 │                         │──Check task────────────────▶│
 │                         │◀─401 Unauthorized────────────│
 │◀─402 Payment Required───│                              │
 │   (amount, recipient,   │                              │
 │    paymentId, taskId)   │                              │
 │                         │                              │
 │──Wallet: send tx────────▶│                              │
 │   (to: recipient,       │                              │
 │    value: amount)       │                              │
 │                         │                              │
 │◀─Tx Hash───────────────││                              │
 │                         │──POST /facilitator/verify──▶│
 │                         │◀─verified / failed──────────│
 │◀─Verification Result────│                              │
 │                         │                              │
 │                         │──createReceipt()────────────▶│
 │                         │◀─Receipt Created Event─────│
 │◀─Receipt Tx Hash────────│                              │
```

## Key Design Decisions

1. **x402-Compatible** - Returns HTTP 402 with structured payment metadata
2. **Facilitator Pattern** - Backend acts as payment facilitator for verification
3. **Event-Based Receipts** - On-chain events provide transparency
4. **Testnet Only** - MockMHA token with faucet for demo purposes
5. **Subject to Validation** - Not production-ready; requires technical validation
