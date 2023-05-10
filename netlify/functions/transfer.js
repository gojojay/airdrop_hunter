const { schedule } = require("@netlify/functions");
require("dotenv").config()

const zksync = require("zksync");
const ethers = require("ethers");

const handler = async function (event, context) {
  console.log("Received event:", event);

  // Connect to zkSync network
  const syncProvider = await zksync.Provider.newHttpProvider(process.env.ZKSYNC_RPC_URL);

  // Create wallets for each account
  const ethProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const ACCOUNT_1 = new ethers.Wallet(process.env.PRIVATE_KEY_1, ethProvider);
  const ACCOUNT_2 = new ethers.Wallet(process.env.PRIVATE_KEY_2, ethProvider);
  const ACCOUNT_3 = new ethers.Wallet(process.env.PRIVATE_KEY_3, ethProvider);
  const syncWallet1 = new zksync.Wallet(ACCOUNT_1, syncProvider);
  const syncWallet2 = new zksync.Wallet(ACCOUNT_2, syncProvider);
  const syncWallet3 = new zksync.Wallet(ACCOUNT_3, syncProvider);

  // Perform transfers
  const transfer1 = await syncWallet1.syncTransfer({
    to: syncWallet2.address(),
    token: "USDC", // replace with your ERC20 token symbol
    amount: zksync.utils.closestPackableTransactionAmount(process.env.TRANSFER_AMOUNT),
  });
  const transfer2 = await syncWallet1.syncTransfer({
    to: syncWallet3.address(),
    token: "USDC", // replace with your ERC20 token symbol
    amount: zksync.utils.closestPackableTransactionAmount(process.env.TRANSFER_AMOUNT),
  });

  console.log(`Transfers Complete!`);
  console.log(`See transactions at: https://zkscan.io/accounts/${syncWallet1.address()}`);

  return {
    statusCode: 200,
  };
}

exports.handler = schedule("@weekly", handler);
