import { appendFile, mkdir, readFile } from 'fs/promises';
import { GITWRIT_DIR, LOG_FILE } from './paths.js';

// ─── setup ────────────────────────────────────────────────────────────────────

async function ensureLogDir() {
  await mkdir(GITWRIT_DIR, { recursive: true });
}

// ─── format ───────────────────────────────────────────────────────────────────

function timestamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

// ─── write ────────────────────────────────────────────────────────────────────

async function write(level, message) {
  await ensureLogDir();
  const line = `${timestamp()}  ${level.padEnd(8)}  ${message}\n`;
  await appendFile(LOG_FILE, line, 'utf8');
}

// ─── public api ───────────────────────────────────────────────────────────────

export const logger = {
  info:   (msg) => write('info',   msg),
  warn:   (msg) => write('warn',   msg),
  error:  (msg) => write('error',  msg),
  commit: (msg) => write('commit', msg),
  push:   (msg) => write('push',   msg),
  pause:  (msg) => write('pause',  msg),
  resume: (msg) => write('resume', msg),
};

// ─── tail ─────────────────────────────────────────────────────────────────────

// returns the last `n` lines of the log file as an array.
// used by `gitwrit logs`.
export async function tailLog(n = 20) {
  try {
    const raw = await readFile(LOG_FILE, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    return lines.slice(-n);
  } catch {
    return []; // log doesn't exist yet
  }
}