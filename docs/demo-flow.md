# MAGNE Agent Pay Demo Flow

A step-by-step guide for demonstrating the x402-compatible AI task payment flow on M Hash L2 Testnet.

## Prerequisites

1. MetaMask or EVM-compatible wallet installed
2. Testnet ETH for gas (M Hash L2 Testnet)
3. MockMHA tokens (obtain from faucet after deployment)
4. Backend server running locally or deployed

## Network Configuration

| Parameter | Value |
|-----------|-------|
| Network Name | M Hash L2 Testnet |
| RPC URL | `https://testnet-rpc.mhash.ai` |
| Chain ID | `20250827` |
| Explorer | `https://testnet-explorer.mhash.ai` |

## Demo Flow

### Step 1: Setup and Configuration

1. Open `frontend/index.html` in a browser
2. Configure network settings:
   - RPC URL: `https://testnet-rpc.mhash.ai`
   - Chain ID: `20250827`
   - Contract addresses (after deployment)

### Step 2: Connect Wallet

1. Click **Connect Wallet**
2. Approve MetaMask connection request
3. Confirm the network is M Hash L2 Testnet
4. Status should show connected address

### Step 3: Create AI Task (Step 1)

1. Select service type:
   - Text Generation
   - Image Analysis
   - Data Processing
   - Code Generation
2. Enter task description (optional)
3. Click **Create Task**

Expected Response:
- HTTP 402 Payment Required
- Payment details displayed
- Task ID and Payment ID generated
- Step 2 becomes active

### Step 4: Payment (Step 2)

1. Review payment information:
   - Amount: 0.01 mMHA
   - Recipient: Facilitator address
   - Network: mhash-l2-testnet
   - Chain ID: 20250827
2. Click **Initiate Payment**
3. Approve transaction in MetaMask
4. Wait for confirmation

Expected Result:
- Transaction hash displayed
- Step 3 becomes active

### Step 5: Verify Payment (Step 3)

1. Transaction hash auto-populated
2. Click **Verify Payment**

Backend will:
1. Query transaction on-chain
2. Verify chain ID matches (20250827)
3. Verify recipient address
4. Verify token amount
5. Return verification status

Expected Result:
- `verified` or `failed` status
- Block number and network info
- Step 4 becomes active

### Step 6: Generate Receipt (Step 4)

1. Click **Generate Receipt**

Backend will:
1. Call `AITaskReceipt.createReceipt()`
2. Emit `AITaskReceiptCreated` event
3. Return transaction hash and explorer link

Expected Result:
- Receipt ID
- Transaction hash
- Explorer URL
- Demo flow complete

## API Endpoints Reference

### POST /agent/task

Creates a new AI task and returns payment requirements.

**Request:**
```json
{
  "userAddress": "0x...",
  "serviceType": "text-generation",
  "taskParams": { "prompt": "..." }
}
```

**Response (402):**
```json
{
  "error": "Payment Required",
  "protocol": "x402-compatible",
  "network": "mhash-l2-testnet",
  "chainId": 20250827,
  "amount": "0.01",
  "currency": "mMHA",
  "recipient": "0x...",
  "paymentId": "pay_...",
  "taskId": "task_...",
  "facilitator": "0x...",
  "description": "AI Agent Task Payment - text-generation"
}
```

### GET /paid-api/wallet-risk

Checks payment status for a task.

**Query Parameters:**
- `taskId` or `paymentId`

**Response (402):**
```json
{
  "protocol": "x402-compatible",
  "network": "mhash-l2-testnet",
  "chainId": 20250827,
  "amount": "0.01",
  "currency": "mMHA",
  "recipient": "0x...",
  "paymentId": "pay_...",
  "taskId": "task_...",
  "facilitator": "0x..."
}
```

### POST /facilitator/verify

Verifies a payment transaction on-chain.

**Request:**
```json
{
  "txHash": "0x...",
  "expectedRecipient": "0x...",
  "expectedAmount": "0.01",
  "expectedToken": "0x...",
  "taskId": "task_..."
}
```

**Response:**
```json
{
  "status": "verified",
  "txHash": "0x...",
  "chainId": 20250827,
  "network": "mhash-l2-testnet",
  "blockNumber": 123456,
  "confirmations": 1,
  "actualAmount": "0.01",
  "actualToken": "0x...",
  "actualRecipient": "0x..."
}
```

### POST /facilitator/receipt

Creates an on-chain AI task receipt.

**Request:**
```json
{
  "taskId": "task_...",
  "userAddress": "0x...",
  "providerAddress": "0x...",
  "agentAddress": "0x...",
  "serviceType": "text-generation",
  "amount": "10000000000000000",
  "tokenAddress": "0x...",
  "paymentTxHash": "0x...",
  "resultHash": "0x...",
  "metadataURI": "ipfs://..."
}
```

**Response:**
```json
{
  "status": "success",
  "receiptId": "0x...",
  "receiptTxHash": "0x...",
  "explorerUrl": "https://testnet-explorer.mhash.ai/tx/0x...",
  "taskId": "task_...",
  "amount": "0.01 mMHA",
  "timestamp": 1234567890
}
```

## Troubleshooting

### "Transaction not found"
- Wait for transaction confirmation
- Check if on correct chain (20250827)
- Verify transaction hash is correct

### "Chain ID mismatch"
- Ensure MetaMask is connected to M Hash L2 Testnet
- Check RPC configuration

### "Insufficient funds"
- Obtain testnet ETH from faucet
- Obtain MockMHA tokens via faucet function

### Contract interaction fails
- Verify contract addresses are correctly configured
- Check contract is deployed to correct network
- Ensure sufficient gas for transaction

## Demo Cleanup

After demo completion:
1. Note all transaction hashes for reference
2. Explorer links for verification
3. Receipt IDs for record

---

**Note:** This is a testnet demonstration. All transactions occur on M Hash L2 Testnet only. No mainnet interactions are involved.
