import chalk from 'chalk';

export function header(text) {
  const line = '═'.repeat(62);
  console.log(chalk.cyan(line));
  console.log(chalk.cyan.bold(` ${text}`));
  console.log(chalk.cyan(line));
  console.log();
}

export function section(emoji, title) {
  console.log(chalk.yellow.bold(`${emoji}  ${title}`));
}

export function row(label, value, color = 'white') {
  const pad = ' '.repeat(3);
  console.log(`${pad}${chalk.gray(label.padEnd(12))} ${chalk[color](value)}`);
}

export function success(text) {
  console.log(chalk.green(`✅ ${text}`));
}

export function error(text) {
  console.log(chalk.red(`❌ ${text}`));
}

export function info(text) {
  console.log(chalk.blue(`ℹ️  ${text}`));
}

export function warning(text) {
  console.log(chalk.yellow(`⚠️  ${text}`));
}

export function box(text) {
  const line = '═'.repeat(62);
  console.log();
  console.log(chalk.cyan(line));
  console.log(chalk.cyan.bold(` ${text}`));
  console.log(chalk.cyan(line));
}

export function bar(label, count, maxWidth = 14) {
  const pad = ' '.repeat(3);
  const barChars = Math.round(count);
  const bar = '█'.repeat(Math.min(barChars, maxWidth)) + '░'.repeat(Math.max(0, maxWidth - barChars));
  console.log(`${pad}${label.padEnd(8)} ${chalk.cyan(bar)} ${chalk.white(count)} trades`);
}

export function formatUSD(value) {
  if (!value && value !== 0) return '$—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value) {
  if (!value && value !== 0) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function shortAddr(addr) {
  if (!addr) return '—';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}
