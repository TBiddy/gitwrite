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

const program = new Command();

program
  .name('gitwrit')
  .description('private, versioned writing for people who live in the terminal.')
  .version('0.1.0')
  .addHelpCommand(false)    // we handle help ourselves
  .helpOption(false);

program.command('init')
  .description('set up gitwrit in the current directory')
  .action(init);

program.command('start')
  .description('start watching your registered directories')
  .action(start);

program.command('stop')
  .description('stop the daemon gracefully')
  .action(stop);

program.command('restart')
  .description('stop and restart the daemon')
  .action(restart);

program.command('status')
  .description('show running state and recent activity')
  .action(status);

program.command('config')
  .description('edit global defaults or local directory overrides')
  .action(config);

program.command('add [path]')
  .description('add a directory to your watch list')
  .action(add);

program.command('remove [path]')
  .description('remove a directory from your watch list')
  .action(remove);

program.command('logs')
  .description('tail the activity log')
  .option('-n, --lines <number>', 'number of lines to show', '20')
  .action((opts) => logs(parseInt(opts.lines, 10)));

program.command('help')
  .description('show all commands')
  .action(help);

// ── hidden daemon command ─────────────────────────────────────────────────────
// not shown in help — only called internally by `start`
program.command('__daemon', { hidden: true })
  .action(() => import('../src/daemon.js'));

// ── fallback: no command given ────────────────────────────────────────────────
if (process.argv.length <= 2) {
  help();
  process.exit(0);
}

program.parse(process.argv);