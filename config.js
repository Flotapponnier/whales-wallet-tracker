import dotenv from 'dotenv';
dotenv.config();

export const config = {
  MOBULA_API_KEY: process.env.MOBULA_API_KEY || '',
  WATCH_INTERVAL_MS: parseInt(process.env.WATCH_INTERVAL_MS || '60000', 10)
};

if (!config.MOBULA_API_KEY) {
  console.error('❌ MOBULA_API_KEY manquant dans .env');
  process.exit(1);
}
