const express = require('express');
const { ethers } = require('ethers');
const { paidTasks } = require('./paidApi');

const router = express.Router();

const RPC_URL = process.env.M_HASH_L2_RPC || 'https://testnet-rpc.mhash.ai';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '20250827');
const FACILITATOR_PRIVATE_KEY = process.env.FACILITATOR_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';
const FACILITATOR_ADDRESS = process.env.FACILITATOR_ADDRESS || '0x0000000000000000000000000000000000000000';
const MOCK_MHA_ADDRESS = process.env.MOCK_MHA_ADDRESS || '0x0000000000000000000000000000000000000000';
const AI_TASK_RECEIPT_ADDRESS = process.env.AI_TASK_RECEIPT_ADDRESS || '0x0000000000000000000000000000000000000000';

// ABI for MockMHA token
const MOCK_MHA_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
];

// ABI for AITaskReceipt
const AI_TASK_RECEIPT_ABI = [
  'function createReceipt(string memory _taskId, address _user, address _provider, address _agent, string memory _serviceType, uint256 _amount, address _token, bytes32 _paymentTxHash, bytes32 _resultHash, string memory _metadataURI) returns (bytes32)',
  'event AITaskReceiptCreated(bytes32 indexed receiptId, string taskId, address indexed user, address provider, address agent, string serviceType, uint256 amount, address token, bytes32 paymentTxHash, bytes32 resultHash, string metadataURI, uint256 timestamp)'
];

// In-memory verified payments (for demo)
const verifiedPayments = new Map();

// Provider and wallet setup
let provider;
let wallet;
let mockMHA;
let aiTaskReceipt;

function initProviders() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(FACILITATOR_PRIVATE_KEY, provider);
    mockMHA = new ethers.Contract(MOCK_MHA_ADDRESS, MOCK_MHA_ABI, provider);
    aiTaskReceipt = new ethers.Contract(AI_TASK_RECEIPT_ADDRESS, AI_TASK_RECEIPT_ABI, wallet);
  }
  return { provider, wallet, mockMHA, aiTaskReceipt };
}

/**
 * POST /facilitator/verify
 * Verifies a payment transaction on-chain
 */
router.post('/verify', async (req, res) => {
  try {
    const { txHash, expectedRecipient, expectedAmount, expectedToken, taskId } = req.body;

    if (!txHash) {
      return res.status(400).json({ error: 'txHash is required' });
    }

    initProviders();
    const { provider } = initProviders();

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return res.json({
        status: 'failed',
        reason: 'Transaction not found or not yet confirmed'
      });
    }

    // Verify chain ID
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== CHAIN_ID) {
      return res.json({
        status: 'failed',
        reason: `Chain ID mismatch. Expected ${CHAIN_ID}, got ${network.chainId}`
      });
    }

    // Check if transaction was successful
    if (receipt.status !== 1) {
      return res.json({
        status: 'failed',
        reason: 'Transaction failed on-chain'
      });
    }

    // Parse logs to verify token transfer - STRICT verification
    let paymentVerified = false;
    let actualAmount = '0';
    let actualToken = null;
    let actualRecipient = null;

    // Simple transfer event signature
    const transferSig = ethers.id('Transfer(address,address,uint256)');
    const expectedAmountNum = parseFloat(expectedAmount || '0');
    const expectedRecipientLower = (expectedRecipient || FACILITATOR_ADDRESS).toLowerCase();
    
    for (const log of receipt.logs) {
      // Must be from MockMHA contract
      if (log.address.toLowerCase() !== MOCK_MHA_ADDRESS.toLowerCase()) {
        continue;
      }
      
      if (log.topics[0] === transferSig) {
        // Parse Transfer event
        const to = ethers.getAddress('0x' + log.topics[2].slice(26));
        const valueBigInt = BigInt(log.data);
        const value = ethers.formatEther(valueBigInt);

        // Strict checks: recipient and amount must match
        const recipientMatch = to.toLowerCase() === expectedRecipientLower;
        const amountMatch = parseFloat(value) >= expectedAmountNum;

        if (recipientMatch && amountMatch) {
          paymentVerified = true;
          actualAmount = value;
          actualToken = log.address;
          actualRecipient = to;
          break;
        }
      }
    }

    if (!paymentVerified) {
      return res.json({
        status: 'failed',
        reason: 'Required mMHA token transfer not found or payment mismatch. Must be: same contract, correct recipient, sufficient amount.',
        txHash,
        chainId: Number(network.chainId),
        network: 'mhash-l2-testnet'
      });
    }

    const verificationResult = {
      status: paymentVerified ? 'verified' : 'failed',
      txHash,
      chainId: Number(network.chainId),
      network: 'mhash-l2-testnet',
      blockNumber: receipt.blockNumber,
      confirmations: receipt.confirmations,
      actualAmount: actualAmount,
      actualToken: actualToken,
      actualRecipient: actualRecipient,
      taskId: taskId || null,
      timestamp: Date.now()
    };

    if (paymentVerified && taskId) {
      verifiedPayments.set(txHash, {
        ...verificationResult,
        verifiedAt: Date.now()
      });
    }

    res.json(verificationResult);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed: ' + error.message });
  }
});

/**
 * POST /facilitator/receipt
 * Creates an on-chain AI task receipt
 */
router.post('/receipt', async (req, res) => {
  try {
    const {
      taskId,
      userAddress,
      providerAddress,
      agentAddress,
      serviceType,
      amount,
      tokenAddress,
      paymentTxHash,
      resultHash,
      metadataURI
    } = req.body;

    if (!taskId || !userAddress || !serviceType) {
      return res.status(400).json({ error: 'taskId, userAddress, and serviceType are required' });
    }

    initProviders();
    const { aiTaskReceipt, provider, wallet } = initProviders();

    // Prepare receipt data
    const receiptTaskId = taskId;
    const receiptUser = userAddress;
    const receiptProvider = providerAddress || FACILITATOR_ADDRESS;
    const receiptAgent = agentAddress || '0x0000000000000000000000000000000000000000';
    const receiptServiceType = serviceType;
    const receiptAmount = amount || ethers.parseEther('0.01');
    const receiptToken = tokenAddress || MOCK_MHA_ADDRESS;
    const receiptPaymentTxHash = paymentTxHash 
      ? ethers.zeroPadValue(paymentTxHash.startsWith('0x') ? paymentTxHash : '0x' + paymentTxHash, 32)
      : ethers.ZeroHash;
    const receiptResultHash = resultHash 
      ? ethers.zeroPadValue(resultHash.startsWith('0x') ? resultHash : '0x' + resultHash, 32)
      : ethers.keccak256(ethers.toUtf8Bytes('demo-result'));
    const receiptMetadataURI = metadataURI || `ipfs://demo/${taskId}`;

    console.log('Creating receipt for task:', receiptTaskId);

    // Call createReceipt on the smart contract
    const tx = await aiTaskReceipt.createReceipt(
      receiptTaskId,
      receiptUser,
      receiptProvider,
      receiptAgent,
      receiptServiceType,
      receiptAmount,
      receiptToken,
      receiptPaymentTxHash,
      receiptResultHash,
      receiptMetadataURI,
      { gasLimit: 500000 }
    );

    const receipt = await tx.wait();

    // Extract receipt ID from event
    let receiptId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = aiTaskReceipt.interface.parseLog(log);
        if (parsed && parsed.name === 'AITaskReceiptCreated') {
          receiptId = parsed.args[0];
          break;
        }
      } catch (e) {
        // Skip unparseable logs
      }
    }

    const explorerBaseUrl = 'https://testnet-explorer.mhash.ai';
    const txHash = receipt.hash;

    res.json({
      status: 'success',
      receiptId: receiptId || '0x' + Buffer.from(taskId).toString('hex').slice(0, 64),
      receiptTxHash: txHash,
      explorerUrl: `${explorerBaseUrl}/tx/${txHash}`,
      taskId: receiptTaskId,
      amount: ethers.formatEther(receiptAmount) + ' mMHA',
      token: receiptToken,
      user: receiptUser,
      timestamp: Date.now(),
      message: 'AI Task Receipt created successfully on M Hash L2'
    });
  } catch (error) {
    console.error('Receipt creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create receipt',
      reason: error.reason || error.message,
      code: error.code
    });
  }
});

/**
 * GET /facilitator/status
 * Check facilitator service status
 */
router.get('/status', async (req, res) => {
  try {
    initProviders();
    const { provider, wallet } = initProviders();

    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(wallet.address);

    res.json({
      status: 'operational',
      service: 'MAGNE Agent Pay Facilitator',
      version: '0.1.0',
      network: {
        name: 'mhash-l2-testnet',
        chainId: Number(network.chainId),
        rpc: RPC_URL
      },
      facilitator: {
        address: wallet.address,
        balance: ethers.formatEther(balance) + ' ETH'
      },
      contracts: {
        mockMHA: MOCK_MHA_ADDRESS,
        aiTaskReceipt: AI_TASK_RECEIPT_ADDRESS
      },
      blockNumber
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router;
