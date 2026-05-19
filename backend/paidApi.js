const express = require('express');
const { ethers } = require('ethers');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const MOCK_MHA = process.env.MOCK_MHA_ADDRESS || '0x0000000000000000000000000000000000000000';
const AI_TASK_RECEIPT = process.env.AI_TASK_RECEIPT_ADDRESS || '0x0000000000000000000000000000000000000000';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '20250827');
const RPC_URL = process.env.M_HASH_L2_RPC || 'https://l2-rpc.testnet.magicalhash.com';
const FACILITATOR_ADDRESS = process.env.FACILITATOR_ADDRESS || '0x0000000000000000000000000000000000000000';

// Payment amount in mMHA (for demo)
const PAYMENT_AMOUNT = ethers.parseEther('0.01');

// In-memory task store (for demo purposes)
const pendingTasks = new Map();

/**
 * POST /agent/task
 * Creates a new AI task and returns payment requirements
 */
router.post('/task', async (req, res) => {
  try {
    const { userAddress, serviceType, taskParams } = req.body;

    if (!userAddress || !serviceType) {
      return res.status(400).json({ error: 'userAddress and serviceType are required' });
    }

    const taskId = `task_${uuidv4()}`;
    const paymentId = `pay_${uuidv4()}`;

    const task = {
      taskId,
      paymentId,
      userAddress,
      serviceType,
      taskParams: taskParams || {},
      status: 'pending_payment',
      amount: PAYMENT_AMOUNT.toString(),
      token: MOCK_MHA,
      createdAt: Date.now()
    };

    pendingTasks.set(taskId, task);

    // Return 402 Payment Required with x402-compatible structure
    res.status(402).json({
      error: 'Payment Required',
      protocol: 'x402-compatible',
      network: 'mhash-l2-testnet',
      chainId: CHAIN_ID,
      amount: ethers.formatEther(PAYMENT_AMOUNT),
      currency: 'mMHA',
      recipient: FACILITATOR_ADDRESS,
      paymentId,
      taskId,
      facilitator: FACILITATOR_ADDRESS,
      description: `AI Agent Task Payment - ${serviceType}`,
      paymentInstructions: {
        token: MOCK_MHA,
        amount: PAYMENT_AMOUNT.toString(),
        amountReadable: ethers.formatEther(PAYMENT_AMOUNT) + ' mMHA',
        chainId: CHAIN_ID,
        network: 'M Hash L2 Testnet',
        rpc: RPC_URL
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /paid-api/wallet-risk
 * Returns payment requirements for a specific task
 */
router.get('/wallet-risk', async (req, res) => {
  try {
    const { taskId, paymentId } = req.query;

    if (!taskId && !paymentId) {
      return res.status(400).json({ error: 'taskId or paymentId is required' });
    }

    // Find task by ID or payment ID
    let task = null;
    if (taskId) {
      task = pendingTasks.get(taskId);
    }
    if (!task && paymentId) {
      for (const [id, t] of pendingTasks) {
        if (t.paymentId === paymentId) {
          task = t;
          break;
        }
      }
    }

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status === 'paid') {
      return res.status(200).json({
        status: 'paid',
        taskId: task.taskId,
        paymentId: task.paymentId,
        message: 'Task has been paid'
      });
    }

    // Return 402 Payment Required
    res.status(402).json({
      protocol: 'x402-compatible',
      network: 'mhash-l2-testnet',
      chainId: CHAIN_ID,
      amount: ethers.formatEther(task.amount),
      currency: 'mMHA',
      recipient: FACILITATOR_ADDRESS,
      paymentId: task.paymentId,
      taskId: task.taskId,
      facilitator: FACILITATOR_ADDRESS,
      description: `AI Agent Task Payment - ${task.serviceType}`,
      paymentInstructions: {
        token: task.token,
        amount: task.amount,
        amountReadable: ethers.formatEther(task.amount) + ' mMHA',
        chainId: CHAIN_ID,
        network: 'M Hash L2 Testnet',
        rpc: RPC_URL
      }
    });
  } catch (error) {
    console.error('Error checking wallet risk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /agent/task/:taskId/complete
 * Mark task as complete (called after payment verification)
 */
router.post('/task/:taskId/complete', async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = pendingTasks.get(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'paid') {
      return res.status(400).json({ error: 'Task has not been paid' });
    }

    task.status = 'completed';
    task.completedAt = Date.now();

    res.json({
      status: 'completed',
      taskId: task.taskId,
      result: {
        message: 'AI task completed',
        serviceType: task.serviceType,
        resultHash: '0x' + Buffer.from(JSON.stringify({ status: 'success', data: 'Demo result' })).toString('hex').slice(0, 64)
      }
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export task store for use by facilitator
module.exports = { router, pendingTasks };
module.exports.router = router;
