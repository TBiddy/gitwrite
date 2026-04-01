import { push, getUnpushedCount } from './git.js';
import { logger } from './logger.js';
import { writeState, readState } from './state.js';
import { notify } from './notify.js';

// ─── scheduler ────────────────────────────────────────────────────────────────

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
        await writeState({ lastPushedAt: new Date().toISOString() });

        if (onPushComplete) onPushComplete(dir);
      } catch (err) {
        await logger.error(`push failed for ${dir}: ${err.message}`);

        // native OS notification — only fires on failure
        notify(
          'gitwrit — Push failed',
          'Your commits are safe locally. Check your network or remote config.'
        );
      }
    }
  }

  const timer = setInterval(flush, interval);

  return {
    queue:    (dir) => pendingRepos.add(dir),
    flushNow: ()    => flush(),
    stop:     ()    => clearInterval(timer),
  };
}