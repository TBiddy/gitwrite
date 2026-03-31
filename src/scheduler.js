import { push, getUnpushedCount } from './git.js';
import { logger } from './logger.js';
import { writeState, readState } from './state.js';

// ─── scheduler ────────────────────────────────────────────────────────────────

// maintains a set of repos that have unpushed commits and pushes them
// on a fixed interval. safe to call multiple times — push is idempotent.
export function createScheduler({ interval, onPushComplete }) {
  const pendingRepos = new Set();

  async function flush() {
    for (const dir of [...pendingRepos]) {
      try {
        const unpushed = await getUnpushedCount(dir);
        if (unpushed === 0) {
          pendingRepos.delete(dir);
          continue;
        }

        await push(dir);
        pendingRepos.delete(dir);
        await logger.push(`${dir}`);

        const state = await readState();
        await writeState({ lastPushedAt: new Date().toISOString() });

        if (onPushComplete) onPushComplete(dir);
      } catch (err) {
        await logger.error(`push failed for ${dir}: ${err.message}`);
      }
    }
  }

  const timer = setInterval(flush, interval);

  return {
    // call this after every successful local commit
    queue: (dir) => pendingRepos.add(dir),

    // flush immediately (e.g. on wake from sleep)
    flushNow: () => flush(),

    stop: () => clearInterval(timer),
  };
}