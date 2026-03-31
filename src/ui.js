import chalk from 'chalk';

// ─── sigil + brand ────────────────────────────────────────────────────────────

export const SIGIL = '✦';

export const brand  = (msg) => chalk.white(`\n  ${SIGIL} ${msg}`);
export const info   = (msg) => chalk.white(`    ${msg}`);
export const good   = (msg) => chalk.green(`  ✔  ${msg}`);
export const bad    = (msg) => chalk.red(`  ✗  ${msg}`);
export const warn   = (msg) => chalk.yellow(`  ⚠  ${msg}`);
export const hint   = (msg) => chalk.dim(`    ${msg}`);
export const divider = (label) =>
  chalk.dim(`\n  ${'─'.repeat(41)}\n  ${label}\n  ${'─'.repeat(41)}`);

// ─── key/value rows ───────────────────────────────────────────────────────────

// prints a two-column row like:
//   watching    ~/notes
export function row(key, value, tag) {
  const k = chalk.dim(key.padEnd(14));
  const v = chalk.white(value);
  const t = tag ? chalk.dim(` (${tag})`) : '';
  return `    ${k}${v}${t}`;
}

// ─── spacing ──────────────────────────────────────────────────────────────────

export const gap = () => console.log();

// ─── printers ─────────────────────────────────────────────────────────────────

export const print = {
  brand:   (msg) => console.log(brand(msg)),
  info:    (msg) => console.log(info(msg)),
  good:    (msg) => console.log(good(msg)),
  bad:     (msg) => console.log(bad(msg)),
  warn:    (msg) => console.log(warn(msg)),
  hint:    (msg) => console.log(hint(msg)),
  divider: (label) => console.log(divider(label)),
  row:     (key, value, tag) => console.log(row(key, value, tag)),
  gap,
};

// ─── time formatting ──────────────────────────────────────────────────────────

export function timeAgo(date) {
  if (!date) return 'never';
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 10)  return 'just now';
  if (seconds < 60)  return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── ms formatting ────────────────────────────────────────────────────────────

export function formatMs(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${ms / 1000}s`;
  return `${ms / 60000} min`;
}