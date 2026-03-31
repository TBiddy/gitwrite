import { loadGlobalConfig } from './settings.js';
import { createWatcher } from './watcher.js';
import { createScheduler } from './scheduler.js';
import { commitFile, commitAll, createAndCheckoutBranch, branchExists } from './git.js';
import { logger } from './logger.js';
import { markRunning, markPaused, markStopped, readState, writeState } from './state.js';
import { unlink } from 'fs/promises';
import { PID_FILE } from './paths.js';

// ─── session ──────────────────────────────────────────────────────────────────

const SESSION_BRANCH = process.env.GITWRIT_SESSION_BRANCH || null;

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const config = await loadGlobalConfig();
  const paths  = config.watch.map(w => w.path);

  await markRunning({
    startedAt:     new Date().toISOString(),
    sessionBranch: SESSION_BRANCH,
    sessionCommits: 0,
  });

  await logger.info('daemon started');

  // ── branch setup ────────────────────────────────────────────────────────────

  if (SESSION_BRANCH) {
    for (const dir of paths) {
      const exists = await branchExists(dir, SESSION_BRANCH);
      if (!exists) {
        await createAndCheckoutBranch(dir, SESSION_BRANCH);
        await logger.info(`created branch ${SESSION_BRANCH} in ${dir}`);
      }
    }
  }

  // ── scheduler ───────────────────────────────────────────────────────────────

  const scheduler = createScheduler({
    interval: config.pushInterval,
    onPushComplete: async (dir) => {
      await logger.push(`pushed ${dir}`);
    },
  });

  // ── commit handler ──────────────────────────────────────────────────────────

  async function handleSave(filepath, dir) {
    const shortPath = filepath.replace(dir, '').replace(/^\//, '');
    const message   = config.commitMessage
      ? config.commitMessage
          .replace('{filename}', shortPath)
          .replace('{timestamp}', new Date().toISOString())
      : `auto: ${shortPath}`;

    try {
      const committed = await commitFile(dir, filepath, message);
      if (!committed) return; // nothing staged — file was already clean

      await logger.commit(`${shortPath}  → ${SESSION_BRANCH || 'current branch'}`);

      const state = await readState();
      await writeState({
        sessionCommits:    (state.sessionCommits || 0) + 1,
        lastCommittedAt:   new Date().toISOString(),
        lastCommittedFile: shortPath,
      });

      scheduler.queue(dir);
    } catch (err) {
      await logger.error(`commit failed: ${filepath} — ${err.message}`);
    }
  }

  // ── watcher ─────────────────────────────────────────────────────────────────

  let watcher = createWatcher({
    paths,
    fileTypes:  config.fileTypes,
    debounce:   config.debounce,
    onSave:     handleSave,
  });

  await logger.info(`watching ${paths.join(', ')}`);

  // ── signal: graceful stop (SIGTERM) ─────────────────────────────────────────

  process.on('SIGTERM', async () => {
    await logger.info('daemon stopped');
    watcher.close();
    scheduler.stop();
    await markStopped();
    await unlink(PID_FILE).catch(() => {});
    process.exit(0);
  });

  // ── signal: sleep/wake (SIGCONT) ─────────────────────────────────────────────
  // sent by the OS when the machine wakes from sleep.
  // chokidar watchers can go stale after a long sleep so we restart them
  // and do a catch-up commit of anything that changed while we were out.

  process.on('SIGCONT', async () => {
    await logger.resume('woke from sleep — running catch-up scan');

    watcher.close();

    // catch-up: commit any dirty files across all watched dirs
    let totalCaught = 0;
    for (const dir of paths) {
      try {
        const count = await commitAll(dir, 'auto: catch-up after sleep');
        totalCaught += count;
        if (count > 0) {
          await logger.commit(`catch-up: ${count} file${count !== 1 ? 's' : ''} in ${dir}`);
          scheduler.queue(dir);
        }
      } catch (err) {
        await logger.error(`catch-up failed in ${dir}: ${err.message}`);
      }
    }

    await writeState({
      resumedAt:     new Date().toISOString(),
      catchUpCommits: totalCaught,
    });

    // restart watchers fresh
    watcher = createWatcher({
      paths,
      fileTypes: config.fileTypes,
      debounce:  config.debounce,
      onSave:    handleSave,
    });

    // push anything that accumulated
    await scheduler.flushNow();

    await logger.resume(`resumed — ${totalCaught} file${totalCaught !== 1 ? 's' : ''} caught up`);
  });

  // ── signal: pause (SIGTSTP) ──────────────────────────────────────────────────
  // sent when the user suspends the process (Ctrl+Z) — shouldn't happen to
  // a detached daemon, but handle it gracefully just in case.

  process.on('SIGTSTP', async () => {
    await markPaused();
    await logger.pause('daemon paused');
  });
}

main().catch(async (err) => {
  await logger.error(`daemon crashed: ${err.message}`);
  process.exit(1);
});