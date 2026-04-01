import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { GITWRIT_DIR } from './paths.js';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ─── current version ──────────────────────────────────────────────────────────

const require = createRequire(import.meta.url);
const PKG = require(join(dirname(fileURLToPath(import.meta.url)), '../package.json'));
const CURRENT_VERSION = PKG.version;

// ─── cache ────────────────────────────────────────────────────────────────────

const CACHE_FILE = join(GITWRIT_DIR, 'update-check.json');
const CACHE_TTL  = 1000 * 60 * 60 * 24; // 24 hours

async function readCache() {
  try {
    const raw = await readFile(CACHE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeCache(data) {
  try {
    await mkdir(GITWRIT_DIR, { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(data), 'utf8');
  } catch {
    // cache write failure is non-fatal
  }
}

// ─── registry fetch ───────────────────────────────────────────────────────────

async function fetchLatestVersion() {
  const res = await fetch('https://registry.npmjs.org/gitwrit/latest', {
    signal: AbortSignal.timeout(3000), // 3s timeout — never block the user
  });
  if (!res.ok) throw new Error(`registry responded ${res.status}`);
  const data = await res.json();
  return data.version;
}

// ─── public api ───────────────────────────────────────────────────────────────

// returns the latest version string if an update is available,
// or null if up to date, offline, or the check fails for any reason.
// always resolves — never rejects.
export async function checkForUpdate() {
  try {
    const cache = await readCache();
    const now   = Date.now();

    // use cached result if fresh
    if (cache && (now - cache.checkedAt) < CACHE_TTL) {
      return isNewer(cache.latestVersion, CURRENT_VERSION)
        ? cache.latestVersion
        : null;
    }

    // fetch fresh
    const latestVersion = await fetchLatestVersion();
    await writeCache({ latestVersion, checkedAt: now });

    return isNewer(latestVersion, CURRENT_VERSION) ? latestVersion : null;
  } catch {
    return null; // offline, registry down, anything — silent
  }
}

export function currentVersion() {
  return CURRENT_VERSION;
}

// ─── semver comparison ────────────────────────────────────────────────────────

function isNewer(latest, current) {
  const parse = v => v.replace(/^v/, '').split('.').map(Number);
  const [lMaj, lMin, lPat] = parse(latest);
  const [cMaj, cMin, cPat] = parse(current);
  if (lMaj !== cMaj) return lMaj > cMaj;
  if (lMin !== cMin) return lMin > cMin;
  return lPat > cPat;
}