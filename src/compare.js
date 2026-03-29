#!/usr/bin/env node

import {
  getWalletPortfolio,
  getWalletAnalysis,
  getWalletLabels
} from './services/mobula.js';
import * as log from './utils/logger.js';

const wallets = process.argv.slice(2);

if (wallets.length < 2) {
  log.error('Usage: npm run compare <WALLET1> <WALLET2> [WALLET3] ...');
  process.exit(1);
}

async function main() {
  try {
    log.header('WHALE COMPARISON');

    const results = await Promise.all(
      wallets.map(wallet => fetchWalletData(wallet))
    );

    // Table header
    console.log('');
    const header = ['Metric'.padEnd(20), ...results.map(r => log.shortAddr(r.wallet).padEnd(18))].join(' │ ');
    console.log(header);
    console.log('─'.repeat(header.length));

    // Labels
    printRow('Labels', results.map(r => (r.labels.labels?.slice(0, 2).join(', ') || '—')));

    // Net Worth
    printRow('Net Worth', results.map(r => log.formatUSD(r.portfolio.total_wallet_balance)));

    // Win Rate
    printRow('Win Rate', results.map(r => {
      const stat = r.analysis.stat;
      const winRate = stat?.periodWinCount && stat?.periodSells
        ? ((stat.periodWinCount / stat.periodSells) * 100).toFixed(1) + '%'
        : '—';
      return winRate;
    }));

    // Realized PnL
    printRow('Realized PnL', results.map(r => log.formatUSD(r.portfolio.total_realized_pnl)));

    // Unrealized PnL
    printRow('Unrealized PnL', results.map(r => log.formatUSD(r.portfolio.total_unrealized_pnl)));

    // Trade Count
    printRow('Trades (30d)', results.map(r => {
      const sells = r.analysis.stat?.periodSells || 0;
      return sells.toString();
    }));

    // Avg Hold Duration
    printRow('Avg Hold', results.map(r => {
      const duration = r.analysis.stat?.holdingDuration || 0;
      return log.formatDuration(duration);
    }));

    console.log('');

    // Winner
    const bestIdx = findBestWallet(results);
    log.success(`🏆 Best performer: ${log.shortAddr(results[bestIdx].wallet)} (Whale Score: ${results[bestIdx].score}/10)`);
    console.log('');

  } catch (err) {
    log.error(`Failed to compare wallets: ${err.message}`);
    process.exit(1);
  }
}

async function fetchWalletData(wallet) {
  const [portfolio, analysis, labels] = await Promise.all([
    getWalletPortfolio(wallet, 'solana'),
    getWalletAnalysis(wallet, 'solana', '30d'),
    getWalletLabels(wallet, 'solana')
  ]);

  const score = calculateWhaleScore(portfolio, analysis, labels);

  return { wallet, portfolio, analysis, labels, score };
}

function printRow(label, values) {
  const row = [label.padEnd(20), ...values.map(v => v.toString().padEnd(18))].join(' │ ');
  console.log(row);
}

function calculateWhaleScore(portfolio, analysis, labels) {
  let score = 0;

  if (portfolio.total_wallet_balance > 1000000) score += 3;
  else if (portfolio.total_wallet_balance > 100000) score += 2;
  else if (portfolio.total_wallet_balance > 10000) score += 1;

  const winRate = analysis.stat?.periodWinCount && analysis.stat?.periodSells
    ? (analysis.stat.periodWinCount / analysis.stat.periodSells * 100)
    : 0;
  if (winRate > 70) score += 3;
  else if (winRate > 60) score += 2;
  else if (winRate > 50) score += 1;

  if (portfolio.total_realized_pnl > 100000) score += 2;
  else if (portfolio.total_realized_pnl > 10000) score += 1;

  if (labels.labels?.includes('proTrader') || labels.labels?.includes('smartMoney')) score += 2;
  else if (labels.labels?.includes('whale')) score += 1;

  return Math.min(score, 10).toFixed(1);
}

function findBestWallet(results) {
  let bestIdx = 0;
  let bestScore = parseFloat(results[0].score);

  for (let i = 1; i < results.length; i++) {
    const score = parseFloat(results[i].score);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  return bestIdx;
}

main();
