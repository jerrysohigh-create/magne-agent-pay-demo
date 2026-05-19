require('dotenv').config();
const express = require('express');
const cors = require('cors');
const paidApiRouter = require('./paidApi');
const facilitatorRouter = require('./facilitator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'MAGNE Agent Pay Demo Backend',
    version: '0.1.0',
    network: process.env.M_HASH_L2_RPC ? 'mhash-l2-testnet' : 'not configured'
  });
});

// Routes
app.use('/agent', require('./paidApi').router);
app.use('/paid-api', require('./paidApi').router);
app.use('/facilitator', require('./facilitator').router);

app.listen(PORT, () => {
  console.log(`MAGNE Agent Pay Demo Backend running on port ${PORT}`);
  console.log(`Network: ${process.env.M_HASH_L2_RPC || 'not configured'}`);
  console.log(`Chain ID: ${process.env.CHAIN_ID || 'not configured'}`);
});

module.exports = app;
