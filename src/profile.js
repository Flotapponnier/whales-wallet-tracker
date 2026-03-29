#!/usr/bin/env node

import {
  getWalletPortfolio,
  getWalletAnalysis,
  getWalletLabels,
  getWalletActivity,
  getWalletPositions,
  getWalletHistory
} from './services/mobula.js';
import * as log from './utils/logger.js';

const [wallet, blockchain = 'solana'] = process.argv.slice(2);

if (!wallet) {
  log.error('Usage: npm run profile <WALLET_ADDRESS> [blockchain]');
  process.exit(1);
}

async function main() {
  try {
    log.info(`Fetching data for ${log.shortAddr(wallet)}...`);

    // Fetch all data in parallel
    const [portfolio, analysis, labels, activity, positions] = await Promise.all([
      getWalletPortfolio(wallet, blockchain),
      getWalletAnalysis(wallet, blockchain, '30d'),
      getWalletLabels(wallet, blockchain),
      getWalletActivity(wallet, blockchain, 5),
      getWalletPositions(wallet, blockchain)
    ]);

    // Header
    log.header(`WHALE PROFILE — ${log.shortAddr(wallet)} (${blockchain})`);

    // 🏷 Identity
    log.section('🏷', 'IDENTITY');
    const labelsList = labels.labels?.join('  ') || 'No labels';
    log.row('Labels:', labelsList, 'magenta');
    log.row('Entity:', labels.walletMetadata?.entityName || 'Unknown wallet', 'white');
    if (labels.walletMetadata?.entityType) {
      log.row('Type:', labels.walletMetadata.entityType, 'gray');
    }
    console.log();

    // 💰 Net Worth
    log.section('💰', 'NET WORTH (30d)');
    log.row('Total:', log.formatUSD(portfolio.total_wallet_balance), 'green');
    log.row('Realized:', `${log.formatUSD(portfolio.total_realized_pnl)} (${log.formatPercent(analysis.stat?.periodRealizedRate * 100)})`, 'green');
    log.row('Unrealized:', log.formatUSD(portfolio.total_unrealized_pnl), 'yellow');
    console.log();

    // 📊 Trading Performance
    log.section('📊', 'TRADING PERFORMANCE (30d)');
    const winRate = analysis.stat?.periodWinCount && analysis.stat?.periodSells
      ? (analysis.stat.periodWinCount / analysis.stat.periodSells * 100).toFixed(1)
      : '—';
    log.row('Win Rate:', `${winRate}%   (${analysis.stat?.periodWinCount || 0} wins / ${analysis.stat?.periodSells || 0} trades)`, 'cyan');
    log.row('Avg Hold:', log.formatDuration(analysis.stat?.holdingDuration || 0), 'white');
    log.row('Buys:', analysis.stat?.periodBuys || 0, 'white');
    log.row('Sells:', analysis.stat?.periodSells || 0, 'white');
    console.log();

    // 🎯 Win Rate Distribution
    if (analysis.winRateDistribution) {
      log.section('🎯', 'WIN RATE DISTRIBUTION');
      const dist = analysis.winRateDistribution;
      if (dist['>500%']) log.bar('>500%', dist['>500%']);
      if (dist['200%-500%']) log.bar('200-500%', dist['200%-500%']);
      if (dist['50%-200%']) log.bar('50-200%', dist['50%-200%']);
      if (dist['0%-50%']) log.bar('0-50%', dist['0%-50%']);
      console.log();
    }

    // 🔬 Token Size Preference
    if (analysis.marketCapDistribution) {
      log.section('🔬', 'TOKEN SIZE PREFERENCE');
      const mcap = analysis.marketCapDistribution;
      if (mcap['<100k']) log.bar('<$100k', mcap['<100k']);
      if (mcap['100k-1M']) log.bar('$100k-1M', mcap['100k-1M']);
      if (mcap['1M-10M']) log.bar('$1M-10M', mcap['1M-10M']);
      if (mcap['10M-100M']) log.bar('$10M-100M', mcap['10M-100M']);
      console.log();
    }

    // 🪙 Top Positions
    if (positions?.data?.length > 0) {
      log.section('🪙', 'TOP POSITIONS (current)');
      positions.data.slice(0, 5).forEach(pos => {
        const totalPnl = (pos.unrealizedPnlUSD || 0) + (pos.realizedPnlUSD || 0);
        const pnlPercent = pos.totalInvestedUSD
          ? (totalPnl / pos.totalInvestedUSD * 100).toFixed(1)
          : 0;
        const color = totalPnl >= 0 ? 'green' : 'red';
        log.row(
          pos.token?.symbol || 'UNKNOWN',
          `${log.formatUSD(pos.balanceUSD)}   PnL: ${log.formatUSD(totalPnl)} (${log.formatPercent(pnlPercent)})`,
          color
        );
      });
      console.log();
    }

    // 📋 Recent Activity
    if (activity?.data?.length > 0) {
      log.section('📋', 'RECENT ACTIVITY (last 5 swaps)');
      activity.data.forEach(tx => {
        if (tx.type === 'swap') {
          const date = log.formatDate(tx.date);
          const tokenIn = tx.tokenIn?.symbol || '?';
          const tokenOut = tx.tokenOut?.symbol || '?';
          const amountIn = tx.tokenIn?.amount?.toFixed(2) || '?';
          const amountOut = tx.tokenOut?.amount?.toLocaleString() || '?';
          const usd = log.formatUSD(tx.tokenOut?.amountUSD);

          console.log(`   ${date}  ${tokenIn} → ${tokenOut}   ${amountIn} → ${amountOut}  (${usd})`);
        }
      });
      console.log();
    }

    // Whale Score
    const score = calculateWhaleScore(portfolio, analysis, labels);
    log.box(`🐋 WHALE SCORE: ${score}/10`);
    const reasons = [];
    if (labels.labels?.includes('proTrader')) reasons.push('proTrader');
    if (labels.labels?.includes('smartMoney')) reasons.push('smartMoney');
    if (parseFloat(winRate) > 60) reasons.push(`${winRate}% win rate`);
    if (portfolio.total_wallet_balance > 100000) reasons.push(log.formatUSD(portfolio.total_wallet_balance) + ' portfolio');
    console.log(`   ${reasons.join(' + ')}`);
    log.box('');

  } catch (err) {
    log.error(`Failed to fetch wallet data: ${err.message}`);
    process.exit(1);
  }
}

function calculateWhaleScore(portfolio, analysis, labels) {
  let score = 0;

  // Portfolio size (0-3 points)
  if (portfolio.total_wallet_balance > 1000000) score += 3;
  else if (portfolio.total_wallet_balance > 100000) score += 2;
  else if (portfolio.total_wallet_balance > 10000) score += 1;

  // Win rate (0-3 points)
  const winRate = analysis.stat?.periodWinCount && analysis.stat?.periodSells
    ? (analysis.stat.periodWinCount / analysis.stat.periodSells * 100)
    : 0;
  if (winRate > 70) score += 3;
  else if (winRate > 60) score += 2;
  else if (winRate > 50) score += 1;

  // PnL (0-2 points)
  if (portfolio.total_realized_pnl > 100000) score += 2;
  else if (portfolio.total_realized_pnl > 10000) score += 1;

  // Labels (0-2 points)
  if (labels.labels?.includes('proTrader') || labels.labels?.includes('smartMoney')) score += 2;
  else if (labels.labels?.includes('whale')) score += 1;

  return Math.min(score, 10).toFixed(1);
}

main();
