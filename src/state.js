import { readFile, writeFile, mkdir } from 'fs/promises';
import { GITWRIT_DIR, STATE_FILE } from './paths.js';

// ─── state values ─────────────────────────────────────────────────────────────

export const STATE = {
  RUNNING: 'running',
  PAUSED:  'paused',
  STOPPED: 'stopped',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

async function ensureDir() {
  await mkdir(GITWRIT_DIR, { recursive: true });
}

export async function readState() {
  try {
    const raw = await readFile(STATE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { status: STATE.STOPPED };
  }
}

export async function writeState(patch) {
  await ensureDir();
  const current = await readState();
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await writeFile(STATE_FILE, JSON.stringify(next, null, 2), 'utf8');
}

// ─── convenience writers ──────────────────────────────────────────────────────

export async function markRunning(sessionData = {}) {
  await writeState({ status: STATE.RUNNING, ...sessionData });
}

export async function markPaused() {
  await writeState({ status: STATE.PAUSED, pausedAt: new Date().toISOString() });
}

export async function markStopped() {
  await writeState({ status: STATE.STOPPED, pausedAt: null });
}