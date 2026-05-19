require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    mhashL2Testnet: {
      url: process.env.M_HASH_L2_RPC || "https://testnet-rpc.mhash.ai",
      chainId: parseInt(process.env.CHAIN_ID || "20250827"),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      gasMultiplier: 1.2
    }
  },
  etherscan: {
    apiKey: {
      mhashL2Testnet: "testnet" // No API key needed for testnet verification
    },
    customChains: []
  },
  paths: {
    sources: "./",
    artifacts: "./artifacts",
    cache: "./cache"
  }
};
