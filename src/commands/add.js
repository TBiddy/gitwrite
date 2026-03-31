import { resolve } from 'path';
import { cwd } from 'process';
import { print } from '../ui.js';
import { addWatchPath, globalConfigExists } from '../settings.js';
import { isGitRepo, hasRemote } from '../git.js';

export async function add(dirArg) {
  const dir = resolve(dirArg || cwd());

  if (!(await globalConfigExists())) {
    print.gap();
    print.bad('gitwrit is not set up yet.');
    print.hint('Run gitwrit init first.');
    print.gap();
    return;
  }

  print.gap();

  if (!(await isGitRepo(dir))) {
    print.bad(`${dir} is not a Git repo.`);
    print.hint('Run git init there first, then try again.');
    print.gap();
    return;
  }

  if (!(await hasRemote(dir))) {
    print.bad('No Git remote configured.');
    print.hint('Add a remote first:  git remote add origin <url>');
    print.gap();
    return;
  }

  const added = await addWatchPath({ type: 'directory', path: dir });

  if (!added) {
    print.warn(`${dir} is already in your watch list.`);
  } else {
    print.good(`${dir} added to your watch list.`);
    print.hint('Run gitwrit restart to start watching it.');
  }

  print.gap();
}
