import { print } from '../ui.js';
import { stop } from './stop.js';
import { start } from './start.js';

export async function restart() {
  print.gap();
  print.brand('Restarting gitwrit...');
  await stop();
  await start();
}
