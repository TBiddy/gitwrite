#!/usr/bin/env node

import { Command } from 'commander';
import { init }    from '../src/commands/init.js';
import { start }   from '../src/commands/start.js';
import { stop }    from '../src/commands/stop.js';
import { restart } from '../src/commands/restart.js';
import { status }  from '../src/commands/status.js';
import { config }  from '../src/commands/config.js';
import { add }     from '../src/commands/add.js';
import { remove }  from '../src/commands/remove.js';
import { logs }    from '../src/commands/logs.js';
import { help }    from '../src/commands/help.js';
import { checkForUpdate, currentVersion } from '../src/updater.js';
import chalk from 'chalk';
import { TEAL, PINK } from '../src/ui.js';

const program = new Command();

program
  .name('gitwrit')
  .description('Private, versioned writing for people who live in the terminal.')
  .version('0.2.1')
  .addHelpCommand(false)
  .helpOption(false);

program.command('init')
  .description('Set up gitwrit in the current directory')
  .action(init);

program.command('start')
  .description('Start watching your registered directories')
  .action(start);

program.command('stop')
  .description('Stop the daemon gracefully')
  .action(stop);

program.command('restart')
  .description('Stop and restart the daemon')
  .action(restart);

program.command('status')
  .description('Show running state and recent activity')
  .action(status);

program.command('config')
  .description('Edit global defaults or local directory overrides')
  .action(config);

program.command('add [path]')
  .description('Add a directory to your watch list')
  .action(add);

program.command('remove [path]')
  .description('Remove a directory from your watch list')
  .action(remove);

program.command('logs')
  .description('Tail the activity log')
  .option('-n, --lines <number>', 'number of lines to show', '20')
  .action((opts) => logs(parseInt(opts.lines, 10)));

program.command('help')
  .description('List all available commands')
  .action(help);

// ── hidden daemon command ─────────────────────────────────────────────────────
program.command('__daemon', { hidden: true })
  .action(() => import('../src/daemon.js'));

// ── fallback: no command given ────────────────────────────────────────────────
if (process.argv.length <= 2) {
  help();
  process.exit(0);
}

// ── run command then check for updates ───────────────────────────────────────
// update check runs after the command completes so it never delays the user.
// shows a single hint line at the bottom if a newer version is available.
program.parseAsync(process.argv).then(async () => {
  const latest = await checkForUpdate();
  if (latest) {
    console.log(
      '\n' +
      chalk.dim('  · Update available: ') +
      chalk.hex(TEAL)(currentVersion()) +
      chalk.dim(' → ') +
      chalk.hex(PINK).bold(latest) +
      chalk.dim('   Run ') +
      chalk.white('npm install -g gitwrit') +
      chalk.dim(' to update.')
    );
  }
});