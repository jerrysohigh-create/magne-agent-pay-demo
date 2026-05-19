# MAGNE Agent Pay Demo Script

**For Exchanges, Investors, and Partners**

*This is a developer demonstration script. Not investment advice. Not production-ready. Subject to technical validation.*

---

## Introduction (30 seconds)

"Thank you for your time today. I'm going to demonstrate **MAGNE Agent Pay**, an x402-compatible payment infrastructure designed to support AI agent task settlements on the M Hash L2 network.

This demonstration is on **M Hash L2 Testnet only** — a high-performance EVM-compatible layer 2 with 400ms block times and sub-cent transaction fees.

**Important Disclaimer**: This is a testnet-stage developer demo. It does not represent production readiness, does not promise any returns, and MHA token is not being promoted for purchase or investment."

---

## The Problem (45 seconds)

"AI agents need to:

1. **Get paid** for their services
2. **Pay** other agents for sub-tasks
3. **Verify payments** automatically
4. **Generate receipts** for accounting

Traditional payment rails are slow, expensive, and not designed for machine-to-machine commerce.

We're building a payment layer that allows AI agents to:
- Publish service offerings with automatic pricing
- Receive payments via standard EVM wallets
- Verify payments on-chain without manual intervention
- Generate cryptographically verifiable receipts

All settled on M Hash L2 for speed and low cost."

---

## Architecture Overview (60 seconds)

[Show architecture diagram]

"The stack consists of:

1. **Smart Contracts** on M Hash L2
   - `MockMHA` — ERC20-like token for testnet demonstrations
   - `AITaskReceipt` — Records task payments with full audit trail

2. **Backend Services**
   - Payment API (x402-compatible)
   - Transaction verification
   - Receipt generation

3. **Frontend Demo**
   - 4-step guided flow showing the complete payment cycle

The key innovation here is the **x402-compatible interface** — a standard HTTP response pattern that tells wallets 'payment required' with all the details needed to pay automatically."

---

## Live Demo Flow (3-5 minutes)

### Step 1: Connect Wallet

"I've connected my MetaMask to M Hash L2 Testnet. Chain ID 20250827.

Notice the RPC endpoint: l2-rpc.testnet.magicalhash.com — this is the testnet infrastructure supporting our demo."

### Step 2: Create Task

"I'll select 'Text Generation' as the service type.

When I click 'Create Task', the backend returns HTTP 402 — the same status code used by websites to say 'you need to pay'. But instead of a generic error, we get structured payment data:

- Protocol: x402-compatible
- Network: mhash-l2-testnet  
- Chain ID: 20250827
- Amount: 0.01 mMHA
- Recipient address
- Unique Payment ID and Task ID

This is designed to allow wallets and AI agents to read payment requirements programmatically."

### Step 3: Payment

"Now I'll initiate payment. The wallet opens showing:
- Recipient: our facilitator address
- Amount: 0.01 mMHA
- Network: M Hash L2 Testnet

I approve. The transaction settles in under a second — remember, M Hash L2 targets 400ms block time."

### Step 4: Verification

"The backend queries the blockchain to verify:
- Transaction exists on the correct chain
- Amount matches
- Recipient is correct
- Transaction status: success

This verification is trust-minimized — anyone can run the verification independently."

### Step 5: Receipt Generation

"Finally, we call `createReceipt()` on the smart contract. This emits an event that creates an immutable, on-chain record of the transaction.

The receipt includes:
- Task ID
- User address
- Provider address
- Agent address
- Service type
- Amount and token
- Payment transaction hash
- Result hash
- Timestamp

All verifiable on the block explorer."

---

## Key Features (60 seconds)

### x402 Compatibility

"x402 is an emerging standard for HTTP-based payment requests. By following this pattern:
- AI services can specify prices in a standard format
- Wallets can interpret payment requirements automatically
- The flow works across different chains and payment methods

This is **planned** to support multiple tokens and chains, subject to technical validation."

### M Hash L2 Benefits

"This demo runs on M Hash L2 Testnet, which is designed to offer:
- ~400ms block time for fast finality
- Sub-cent transaction fees (target: <$0.0025)
- EVM compatibility for easy integration

**Note**: These are design targets for testnet. Mainnet performance characteristics are subject to network conditions and technical validation."

### Receipt Infrastructure

"The `AITaskReceipt` contract provides:
- Immutable audit trail
- Event-based (gas efficient)
- Programmatically verifiable
- Supports multiple service types

This is designed for AI agents to maintain their own payment records autonomously."

---

## Use Cases (45 seconds)

"The infrastructure is designed to support scenarios such as:

1. **AI Service Marketplaces** — Agents publish services with automatic pricing and payment handling

2. **Multi-Agent Workflows** — One agent pays another for sub-tasks, with automatic receipt generation

3. **Enterprise AI Procurement** — Organizations pay for AI services with full on-chain audit trail

4. **Cross-Chain Payments** — Designed (not guaranteed) to support multiple chains and tokens

**Important**: These are planned use cases. The infrastructure is under development and not production-ready."

---

## What's Next (30 seconds)

"Our roadmap, subject to change:

- **Phase 1** (Complete): Testnet demo with MockMHA ✓
- **Phase 2** (In Progress): Real MHA token integration
- **Phase 3** (Planned): Multi-chain support
- **Phase 4** (Planned): Automated agent payment channels

**Timeline and features are subject to technical validation and may change without notice.**"

---

## Compliance Notes

When presenting to exchanges or investors, always include:

✅ **DO SAY:**
- "This is a testnet demonstration"
- "Subject to technical validation"
- "Design target" / "Planned to support"
- "Not production-ready"
- "No guarantees on timeline or features"
- "For developer evaluation only"
- "This is not a production payment integration. It is a testnet-stage developer demonstration designed for technical review, architecture validation, and ecosystem discussion."

❌ **DO NOT SAY:**
- "MHA will appreciate"
- "Guaranteed low fees"
- "Production ready"
- "Ready to integrate with your exchange"
- "This is investment advice"
- Any promise of specific returns or dates

---

## Demo Conclusion

"Thank you for watching this demonstration.

To be clear:
- This is a **testnet developer demo**
- No Mainnet deployment has occurred
- MHA token is **not** being sold
- This does not constitute investment advice
- All technical specifications are subject to change

For technical questions or collaboration inquiries, please reach out to the development team."

---

## Q&A Preparation

### "When mainnet?"
No timeline announced. Testnet is for developer evaluation only.

### "Will fees really be sub-cent?"
This is the design target. Actual fees depend on network conditions.

### "Can we integrate now?"
The infrastructure is not production-ready. We welcome technical feedback from developers.

### "What tokens will be supported?"
Planning to support multiple tokens. No specific commitments.

### "What about regulatory compliance?"
We're building technology. Compliance is the responsibility of users and integrators.

---

*Last updated: Testnet Demo V0.1*
