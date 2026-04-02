import boxen from 'boxen';
import chalk from 'chalk';
import { print, TEAL, PINK } from '../ui.js';
import { renderBanner } from '../banner.js';

// ─── demo ─────────────────────────────────────────────────────────────────────
//
// renders gitwrit's UI with placeholder data — no real paths, no real usernames.
// useful for screenshots, documentation, and promo material.
//
// shows three screens in sequence:
//   1. gitwrit start output
//   2. gitwrit status output
//   3. gitwrit stop output

function boxRow(label, value) {
  return chalk.dim(`  ${label.padEnd(13)}`) + chalk.white(value);
}

const BOX_OPTS = {
  padding:     { top: 0, bottom: 0, left: 1, right: 2 },
  borderStyle: 'round',
  borderColor: TEAL,
};

export function demo() {
  // ── start ──────────────────────────────────────────────────────────────────

  renderBanner();

  print.good('gitwrit is running.');
  print.gap();
  print.row('Watching',    '~/notes, ~/projects/docs');
  print.row('Files',       '.md, .mdx');
  print.row('Branch',      'Current branch');
  print.row('Committing',  '3s after last save');
  print.row('Pushing',     'Every 5 min');
  print.gap();
  print.hint('Type all you want, we\'ve got you.');
  print.gap();

  // ── status ─────────────────────────────────────────────────────────────────

  const statusLines = [
    '',
    chalk.hex(TEAL).bold('  gitwrit is running.'),
    '',
    boxRow('Uptime',      '42m'),
    boxRow('Watching',    '~/notes, ~/projects/docs'),
    boxRow('Branch',      'Current branch'),
    boxRow('Commits',     '12 this session'),
    boxRow('Last commit', '26s ago  (ideas.md)'),
    boxRow('Last push',   '2m ago'),
    '',
  ];

  console.log(boxen(statusLines.join('\n'), BOX_OPTS));
  print.gap();

  // ── stop ───────────────────────────────────────────────────────────────────

  const stopLines = [
    chalk.hex(TEAL).bold('  gitwrit stopped.'),
    '',
    chalk.dim('  Committed   ') + chalk.white('12 times this session'),
    chalk.dim('  Last push   ') + chalk.white('2m ago'),
    '',
    chalk.dim('  Your work is safe. See you next time.'),
  ];

  console.log(
    boxen(stopLines.join('\n'), {
      padding: { top: 0, bottom: 0, left: 1, right: 2 },
      borderStyle: 'round',
      borderColor: TEAL,
    })
  );
  print.gap();
  print.hint('This is a demo. Run gitwrit start to begin a real session.');
  print.gap();
}