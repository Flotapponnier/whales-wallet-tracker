#!/usr/bin/env node

import {
  getWalletPortfolio,
  getWalletActivity
} from './services/mobula.js';
import * as log from './utils/logger.js';
import { config } from '../config.js';

const [wallet, blockchain = 'solana'] = process.argv.slice(2);

if (!wallet) {
  log.error('Usage: npm run watch <WALLET_ADDRESS> [blockchain]');
  process.exit(1);
}

let lastNetWorth = null;
let lastActivityHash = '';

async function poll() {
  try {
    const [portfolio, activity] = await Promise.all([
      getWalletPortfolio(wallet, blockchain),
      getWalletActivity(wallet, blockchain, 5)
    ]);

    const netWorth = portfolio.total_wallet_balance;
    const currentHash = JSON.stringify(activity.data?.map(a => a.date + a.type));

    // Net worth change
    if (lastNetWorth !== null) {
      const delta = netWorth - lastNetWorth;
      const deltaStr = delta >= 0 ? `+${log.formatUSD(delta)}` : log.formatUSD(delta);
      const status = Math.abs(delta) < 100 ? 'stable' : deltaStr;

      const timestamp = new Date().toLocaleTimeString('en-GB');
      console.log(`[${timestamp}] Net worth: ${log.formatUSD(netWorth)}  ${status}`);

      // New activity detected
      if (currentHash !== lastActivityHash && activity.data?.length > 0) {
        const latestTx = activity.data[0];

        if (latestTx.type === 'swap') {
          const tokenOut = latestTx.tokenOut?.symbol || 'UNKNOWN';
          const amountIn = latestTx.tokenIn?.amount?.toFixed(2) || '?';
          const tokenIn = latestTx.tokenIn?.symbol || '?';
          const usd = log.formatUSD(latestTx.tokenOut?.amountUSD);

          const action = detectSwapDirection(latestTx) === 'buy' ? 'BUY' : 'SELL';
          const emoji = action === 'BUY' ? '🟢' : '💸';

          console.log(`           NEW ${action}: ${amountIn} ${tokenIn} → ${tokenOut}  (${usd}) ${emoji}`);

          // Large buy alert
          if (action === 'BUY' && latestTx.tokenOut?.amountUSD > 10000) {
            console.log(`           🚨 LARGE BUY: ${log.formatUSD(latestTx.tokenOut.amountUSD)}`);
          }
        } else if (latestTx.type === 'transfer') {
          const usd = log.formatUSD(latestTx.amountUSD);
          console.log(`           NEW TRANSFER: ${latestTx.symbol || '?'} ${usd}`);
        }
      }
    } else {
      // First poll
      const timestamp = new Date().toLocaleTimeString('en-GB');
      console.log(`[${timestamp}] Net worth: ${log.formatUSD(netWorth)}  (initial)`);
    }

    lastNetWorth = netWorth;
    lastActivityHash = currentHash;

  } catch (err) {
    log.error(`Poll failed: ${err.message}`);
  }
}

function detectSwapDirection(tx) {
  // Heuristic: if tokenIn is a stablecoin or major token, it's likely a BUY
  const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD'];
  const majors = ['SOL', 'ETH', 'BTC', 'WETH', 'WBTC'];

  const tokenIn = tx.tokenIn?.symbol || '';
  const tokenOut = tx.tokenOut?.symbol || '';

  if (stablecoins.includes(tokenIn) || majors.includes(tokenIn)) {
    return 'buy';
  } else if (stablecoins.includes(tokenOut) || majors.includes(tokenOut)) {
    return 'sell';
  }

  // Default: assume buy if we can't determine
  return 'buy';
}

async function main() {
  log.info(`👀 Watching ${log.shortAddr(wallet)}  |  poll: ${config.WATCH_INTERVAL_MS / 1000}s`);
  console.log('─'.repeat(62));

  // Initial poll
  await poll();

  // Polling loop
  setInterval(poll, config.WATCH_INTERVAL_MS);
}

main();
