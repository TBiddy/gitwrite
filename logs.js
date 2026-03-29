import chalk from 'chalk';
import { print } from '../ui.js';
import { tailLog } from '../logger.js';

function colorize(line) {
  if (line.includes('  commit  '))  return chalk.green(line);
  if (line.includes('  push    '))  return chalk.blue(line);
  if (line.includes('  error   '))  return chalk.red(line);
  if (line.includes('  warn    '))  return chalk.yellow(line);
  if (line.includes('  pause   '))  return chalk.dim(line);
  if (line.includes('  resume  '))  return chalk.cyan(line);
  return chalk.dim(line);
}

export async function logs(n = 20) {
  const lines = await tailLog(n);

  print.gap();
  print.brand(`gitwrit log — last ${n} entries`);
  print.gap();

  if (lines.length === 0) {
    print.hint('No activity yet. Run gitwrit start to begin.');
    print.gap();
    return;
  }

  for (const line of lines) {
    console.log('  ' + colorize(line));
  }

  print.gap();
}
