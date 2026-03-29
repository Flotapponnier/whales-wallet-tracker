import axios from 'axios';
import { config } from '../../config.js';

const API_BASE = 'https://api.mobula.io';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': config.MOBULA_API_KEY
  }
});

/**
 * GET /api/1/wallet/portfolio
 * Portfolio complet + PnL réalisé/non-réalisé
 */
export async function getWalletPortfolio(wallet, blockchain = 'solana') {
  const { data } = await client.get('/api/1/wallet/portfolio', {
    params: { wallet, blockchain }
  });
  return data.data;
}

/**
 * GET /api/2/wallet/analysis
 * Score de trader + win rate détaillé + labels
 */
export async function getWalletAnalysis(wallet, blockchain = 'solana', period = '30d') {
  const { data } = await client.get('/api/2/wallet/analysis', {
    params: { wallet, blockchain, period }
  });
  return data.data;
}

/**
 * GET /api/2/wallet/labels
 * Labels (proTrader, whale, smartMoney...) + metadata
 */
export async function getWalletLabels(wallet, blockchain = 'solana') {
  const { data } = await client.get('/api/2/wallet/labels', {
    params: { wallet, blockchain }
  });
  return data.data;
}

/**
 * GET /api/2/wallet/activity
 * Feed temps réel de toute l'activité (swaps, transfers...)
 */
export async function getWalletActivity(wallet, blockchain = 'solana', limit = 20) {
  const { data } = await client.get('/api/2/wallet/activity', {
    params: { wallet, blockchain, limit }
  });
  return data.data;
}

/**
 * GET /api/2/wallet/positions
 * Positions actuelles avec PnL par token
 */
export async function getWalletPositions(wallet, blockchain = 'solana') {
  const { data } = await client.get('/api/2/wallet/positions', {
    params: { wallet, blockchain }
  });
  return data.data;
}

/**
 * GET /api/2/wallet/history
 * Net worth historique (courbe dans le temps)
 */
export async function getWalletHistory(wallet, blockchain = 'solana', from, to) {
  const params = { wallet, blockchain };
  if (from) params.from = from;
  if (to) params.to = to;

  const { data } = await client.get('/api/2/wallet/history', { params });
  return data.data;
}
