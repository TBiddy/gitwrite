import { confirm } from '@inquirer/prompts';
import { resolve } from 'path';
import { cwd } from 'process';
import { print } from '../ui.js';
import { removeWatchPath, globalConfigExists } from '../settings.js';

export async function remove(dirArg) {
  const dir = resolve(dirArg || cwd());

  if (!(await globalConfigExists())) {
    print.gap();
    print.bad('gitwrit is not set up yet.');
    print.gap();
    return;
  }

  print.gap();

  const confirmed = await confirm({
    message: `Remove ${dir} from your watch list?`,
    default: false,
  });

  if (!confirmed) {
    print.hint('No changes made.');
    print.gap();
    return;
  }

  const removed = await removeWatchPath(dir);

  if (!removed) {
    print.warn(`${dir} was not in your watch list.`);
  } else {
    print.good('Done.');
    print.hint('Run gitwrit restart to apply.');
  }

  print.gap();
}
