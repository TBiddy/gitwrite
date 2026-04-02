#!/usr/bin/env node

import { Command } from 'commander';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
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
import { demo }    from '../src/commands/demo.js';
import { checkForUpdate, currentVersion } from '../src/updater.js';
import chalk from 'chalk';
import { TEAL, PINK } from '../src/ui.js';

// ── dynamic version from package.json ────────────────────────────────────────
// never hardcode the version — read it directly from package.json so
// gitwrit --version always matches the published version automatically.
const require = createRequire(import.meta.url);
const PKG = require(join(dirname(fileURLToPath(import.meta.url)), '../package.json'));

const program = new Command();

program
  .name('gitwrit')
  .description('Private, versioned writing for people who live in the terminal.')
  .version(PKG.version)
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

program.command('demo')
  .description('Preview gitwrit\'s UI with placeholder data')
  .action(demo);

// ── hidden daemon command ─────────────────────────────────────────────────────
program.command('__daemon', { hidden: true })
  .action(() => import('../src/daemon.js'));

// ── fallback: no command given ────────────────────────────────────────────────
if (process.argv.length <= 2) {
  help();
  process.exit(0);
}

// ── run command then check for updates ───────────────────────────────────────
// runs after the command completes — never blocks or delays the user.
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
      chalk.white('npm install -g gitwrit@latest') +
      chalk.dim(' to update.')
    );
  }
});