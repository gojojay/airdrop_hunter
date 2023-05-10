const { schedule } = require("@netlify/functions");
const { ethers } = require("ethers");
const zksync = require("zksync");
require("dotenv").config();

const SyncswapRouterABI = require("../../SyncswapRouterABI.json");

const handler = async function (event, context) {
  console.log("Received event:", event);

  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

  const ACCOUNT_1 = new ethers.Wallet(process.env.PRIVATE_KEY_1, provider);

  const syncswapRouterAddress = "0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295"; // Replace this with the Syncswap router contract address
  const SYNC_SWAP_ROUTER = new ethers.Contract(
    syncswapRouterAddress,
    SyncswapRouterABI,
    provider
  );

  const PATH = [process.env.WETH_ADDRESS, process.env.TOKEN_ADDRESS];
  const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

  const transaction = await SYNC_SWAP_ROUTER.connect(ACCOUNT_1).swapExactETHForTokens(
    0,
    PATH,
    ACCOUNT_1.address,
    DEADLINE,
    { value: process.env.SWAP_AMOUNT }
  );

  console.log(`Swap Complete!`);

  // zkSync part
  const syncProvider = await zksync.getDefaultProvider("mainnet");
  const syncWallet = await zksync.Wallet.fromEthSigner(ACCOUNT_1, syncProvider);

  const zksyncTx = await syncProvider.getTransactionReceipt(transaction.hash);

  console.log(`See transaction at: https://zksync2-mainnet.zkscan.io/explorer/transactions/${zksyncTx.hash}`);

  return {
    statusCode: 200,
  };
};

exports.handler = schedule("@weekly", handler);
