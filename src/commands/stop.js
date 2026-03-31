import { readFile, unlink } from 'fs/promises';
import { print, timeAgo } from '../ui.js';
import { PID_FILE } from '../paths.js';
import { readState, markStopped } from '../state.js';

export async function stop() {
  let pid;

  try {
    const raw = await readFile(PID_FILE, 'utf8');
    pid = parseInt(raw.trim(), 10);
  } catch {
    print.gap();
    print.bad('gitwrit is not running.');
    print.gap();
    return;
  }

  try {
    process.kill(pid, 0);
  } catch {
    await unlink(PID_FILE).catch(() => {});
    await markStopped();
    print.gap();
    print.bad('gitwrit is not running.');
    print.gap();
    return;
  }

  const state = await readState();

  process.kill(pid, 'SIGTERM');
  await new Promise(r => setTimeout(r, 500));

  await unlink(PID_FILE).catch(() => {});
  await markStopped();

  print.gap();
  print.brand('gitwrit stopped.');
  print.gap();

  if (state.sessionCommits > 0) {
    print.row('Committed', `${state.sessionCommits} time${state.sessionCommits !== 1 ? 's' : ''} this session`);
  }

  if (state.lastPushedAt) {
    print.row('Last push', timeAgo(state.lastPushedAt));
  }

  if (state.sessionBranch) {
    print.row('Branch', state.sessionBranch);
  }

  print.gap();
  print.hint('Your work is safe. See you next time.');
  print.gap();
}
