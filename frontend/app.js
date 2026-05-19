// MAGNE Agent Pay Demo - Frontend Application
// x402-Compatible AI Task Payment Flow on M Hash L2 Testnet

class MAGNEAgentPayDemo {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.taskId = null;
    this.paymentId = null;
    this.paymentInfo = null;
    this.backendUrl = document.getElementById('rpcUrl')?.value?.includes('localhost') 
      ? 'http://localhost:3000' 
      : '';

    this.initEventListeners();
    this.log('info', 'MAGNE Agent Pay Demo initialized');
    this.log('warning', 'This is a testnet demo. Not for production use.');
  }

  initEventListeners() {
    document.getElementById('connectWallet')?.addEventListener('click', () => this.connectWallet());
    document.getElementById('createTask')?.addEventListener('click', () => this.createTask());
    document.getElementById('initiatePayment')?.addEventListener('click', () => this.initiatePayment());
    document.getElementById('verifyPayment')?.addEventListener('click', () => this.verifyPayment());
    document.getElementById('generateReceipt')?.addEventListener('click', () => this.generateReceipt());

    // Update backend URL when RPC changes
    document.getElementById('rpcUrl')?.addEventListener('change', (e) => {
      this.backendUrl = e.target.value.includes('localhost') ? 'http://localhost:3000' : '';
    });
  }

  async connectWallet() {
    try {
      this.log('info', 'Connecting to wallet...');

      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask or EVM-compatible wallet not found');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.address = accounts[0];
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = this.provider.getSigner();

      // Get network info
      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);

      // Update UI
      const connectBtn = document.getElementById('connectWallet');
      connectBtn.textContent = `🔗 ${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
      connectBtn.disabled = true;

      document.getElementById('chainId').value = this.chainId;

      this.log('success', `Connected: ${this.address}`);
      this.log('info', `Network Chain ID: ${this.chainId}`);

      // Listen for account/network changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          this.address = accounts[0];
          this.log('info', `Account changed: ${this.address}`);
        } else {
          this.disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        this.chainId = parseInt(chainId, 16);
        this.log('info', `Network changed. Chain ID: ${this.chainId}`);
        document.getElementById('chainId').value = this.chainId;
      });

    } catch (error) {
      this.log('error', `Wallet connection failed: ${error.message}`);
    }
  }

  async createTask() {
    const serviceType = document.getElementById('serviceType')?.value;
    const taskPrompt = document.getElementById('taskPrompt')?.value;

    if (!this.address) {
      this.log('error', 'Please connect your wallet first');
      return;
    }

    if (!serviceType) {
      this.log('error', 'Please select a service type');
      return;
    }

    try {
      this.updateStepStatus('step1', 'pending', 'Processing...');
      this.log('info', `Creating task: ${serviceType}`);

      // Call backend to create task
      const response = await fetch(`${this.backendUrl}/agent/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: this.address,
          serviceType,
          taskParams: { prompt: taskPrompt }
        })
      });

      const data = await response.json();

      if (response.status === 402) {
        // Payment required
        this.taskId = data.taskId;
        this.paymentId = data.paymentId;
        this.paymentInfo = data;

        this.log('success', `Task created: ${this.taskId}`);
        this.log('info', `Payment required: ${data.amount} ${data.currency}`);

        // Update UI
        this.updateStepStatus('step1', 'success', 'Created');
        this.activateStep('step2');
        this.displayPaymentInfo(data);
        document.getElementById('initiatePayment').disabled = false;

        // Show result
        const resultEl = document.getElementById('step1Result');
        resultEl.innerHTML = `<strong>Task ID:</strong> ${this.taskId}<br><strong>Service:</strong> ${serviceType}`;
        resultEl.classList.add('visible', 'success');

      } else {
        throw new Error(data.error || 'Unexpected response');
      }

    } catch (error) {
      this.log('error', `Task creation failed: ${error.message}`);
      this.updateStepStatus('step1', 'error', 'Failed');
    }
  }

  displayPaymentInfo(data) {
    const paymentInfoEl = document.getElementById('paymentInfo');
    paymentInfoEl.innerHTML = `
      <div class="payment-detail">
        <span class="payment-label">Protocol</span>
        <span class="payment-value">${data.protocol}</span>
      </div>
      <div class="payment-detail">
        <span class="payment-label">Network</span>
        <span class="payment-value">${data.network}</span>
      </div>
      <div class="payment-detail">
        <span class="payment-label">Chain ID</span>
        <span class="payment-value">${data.chainId}</span>
      </div>
      <div class="payment-detail">
        <span class="payment-label">Amount</span>
        <span class="payment-value">${data.amount} ${data.currency}</span>
      </div>
      <div class="payment-detail">
        <span class="payment-label">Recipient</span>
        <span class="payment-value">${data.recipient}</span>
      </div>
      <div class="payment-detail">
        <span class="payment-label">Payment ID</span>
        <span class="payment-value">${data.paymentId}</span>
      </div>
      <div class="payment-detail">
        <span class="payment-label">Task ID</span>
        <span class="payment-value">${data.taskId}</span>
      </div>
    `;
  }

  async initiatePayment() {
    if (!this.paymentInfo) {
      this.log('error', 'No payment info available');
      return;
    }

    try {
      this.updateStepStatus('step2', 'pending', 'Waiting for wallet...');
      this.log('info', 'Initiating mMHA payment via ERC20 transfer...');

      const tokenAddress = this.paymentInfo.paymentInstructions?.token;
      const amount = this.paymentInfo.paymentInstructions?.amount;

      if (!tokenAddress || !amount) {
        throw new Error('Missing token or amount in payment instructions');
      }

      // ERC20 transfer - pay with mMHA, not native ETH
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)'
        ],
        this.signer
      );

      // Check user balance first
      const balance = await tokenContract.balanceOf(this.address);
      const parseAmount = ethers.parseEther(amount.toString());
      this.log('info', `Balance: ${ethers.formatEther(balance)} mMHA, Required: ${amount} mMHA`);

      if (balance < parseAmount) {
        throw new Error(`Insufficient mMHA balance. Have: ${ethers.formatEther(balance)}, Need: ${amount}`);
      }

      const tx = await tokenContract.transfer(this.paymentInfo.recipient, parseAmount);
      this.log('info', `Transaction sent: ${tx.hash}`);
      this.updateStepStatus('step2', 'pending', 'Awaiting confirmation...');

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        this.log('success', `Payment confirmed: ${tx.hash}`);
        this.txHash = tx.hash;

        this.updateStepStatus('step2', 'success', 'Paid');
        this.activateStep('step3');
        document.getElementById('txHash').value = tx.hash;
        document.getElementById('verifyPayment').disabled = false;

        const resultEl = document.getElementById('step2Result');
        resultEl.innerHTML = `
          <strong>Transaction Hash:</strong> ${tx.hash}<br>
          <strong>Block:</strong> ${receipt.blockNumber}<br>
          <strong>Token:</strong> mMHA<br>
          <strong>Amount:</strong> ${amount} mMHA<br>
          <strong>Status:</strong> Confirmed
        `;
        resultEl.classList.add('visible', 'success');

      } else {
        throw new Error('Transaction failed on-chain');
      }

    } catch (error) {
      this.log('error', `Payment failed: ${error.message}`);
      this.updateStepStatus('step2', 'error', 'Failed');
    }
  }

  async verifyPayment() {
    const txHash = document.getElementById('txHash')?.value;

    if (!txHash) {
      this.log('error', 'Please enter a transaction hash');
      return;
    }

    try {
      this.updateStepStatus('step3', 'pending', 'Verifying...');
      this.log('info', `Verifying payment: ${txHash}`);

      const response = await fetch(`${this.backendUrl}/facilitator/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash,
          expectedRecipient: this.paymentInfo?.recipient,
          expectedAmount: this.paymentInfo?.amount,
          expectedToken: this.paymentInfo?.token,
          taskId: this.taskId
        })
      });

      const data = await response.json();

      if (data.status === 'verified') {
        this.log('success', `Payment verified: ${data.status}`);
        this.updateStepStatus('step3', 'success', 'Verified');
        this.activateStep('step4');
        document.getElementById('generateReceipt').disabled = false;

        const resultEl = document.getElementById('step3Result');
        resultEl.innerHTML = `
          <strong>Verification:</strong> ${data.status}<br>
          <strong>Network:</strong> ${data.network}<br>
          <strong>Chain ID:</strong> ${data.chainId}<br>
          <strong>Block:</strong> ${data.blockNumber}
        `;
        resultEl.classList.add('visible', 'success');

      } else {
        throw new Error(data.reason || 'Verification failed');
      }

    } catch (error) {
      this.log('error', `Verification failed: ${error.message}`);
      this.updateStepStatus('step3', 'error', 'Failed');
    }
  }

  async generateReceipt() {
    if (!this.taskId || !this.address) {
      this.log('error', 'Missing task or wallet info');
      return;
    }

    try {
      this.updateStepStatus('step4', 'pending', 'Generating...');
      this.log('info', 'Generating AI Task Receipt...');

      const response = await fetch(`${this.backendUrl}/facilitator/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: this.taskId,
          userAddress: this.address,
          providerAddress: this.paymentInfo?.facilitator,
          agentAddress: '0x0000000000000000000000000000000000000000',
          serviceType: document.getElementById('serviceType')?.value,
          amount: this.paymentInfo?.amount ? ethers.parseEther(this.paymentInfo.amount).toString() : '10000000000000000',
          tokenAddress: this.paymentInfo?.token,
          paymentTxHash: this.txHash,
          resultHash: ethers.keccak256(ethers.toUtf8Bytes('demo-result')),
          metadataURI: `ipfs://demo/${this.taskId}`
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        this.log('success', `Receipt generated: ${data.receiptId}`);
        this.updateStepStatus('step4', 'success', 'Complete');

        const resultEl = document.getElementById('step4Result');
        resultEl.innerHTML = `
          <strong>Receipt ID:</strong> ${data.receiptId}<br>
          <strong>Transaction:</strong> <a href="${data.explorerUrl}" target="_blank">${data.receiptTxHash}</a><br>
          <strong>Task:</strong> ${data.taskId}<br>
          <strong>Amount:</strong> ${data.amount}
        `;
        resultEl.classList.add('visible', 'success');

        this.log('success', 'Demo flow completed!');
        this.log('warning', 'This receipt was generated on testnet demo environment.');

      } else {
        throw new Error(data.error || 'Failed to generate receipt');
      }

    } catch (error) {
      this.log('error', `Receipt generation failed: ${error.message}`);
      this.updateStepStatus('step4', 'error', 'Failed');
    }
  }

  activateStep(stepId) {
    const step = document.getElementById(stepId);
    if (step) {
      step.classList.add('active');
    }
  }

  updateStepStatus(stepId, status, text) {
    const statusEl = document.getElementById(`${stepId}Status`);
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = `step-status ${status}`;
    }
  }

  log(type, message) {
    const logEl = document.getElementById('eventLog');
    if (!logEl) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const time = new Date().toLocaleTimeString();
    entry.innerHTML = `
      <span class="log-time">${time}</span>
      <span class="log-type ${type}">[${type.toUpperCase()}]</span>
      <span class="log-message">${message}</span>
    `;

    logEl.insertBefore(entry, logEl.firstChild);

    // Limit log entries
    while (logEl.children.length > 50) {
      logEl.removeChild(logEl.lastChild);
    }

    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// Initialize demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.magneDemo = new MAGNEAgentPayDemo();
});
