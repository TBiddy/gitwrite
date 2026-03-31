import simpleGit from 'simple-git';

export async function isGitRepo(dir) {
  try {
    const git = simpleGit(dir);
    await git.revparse(['--git-dir']);
    return true;
  } catch {
    return false;
  }
}

export async function hasRemote(dir) {
  const git = simpleGit(dir);
  const remotes = await git.getRemotes();
  return remotes.length > 0;
}

export async function getCurrentBranch(dir) {
  const git = simpleGit(dir);
  const name = await git.revparse(['--abbrev-ref', 'HEAD']);
  return name.trim();
}

export async function branchExists(dir, name) {
  const git = simpleGit(dir);
  const branches = await git.branchLocal();
  return branches.all.includes(name);
}

export async function createAndCheckoutBranch(dir, name) {
  const git = simpleGit(dir);
  await git.checkoutLocalBranch(name);
}

export async function commitFile(dir, filepath, message) {
  const git = simpleGit(dir);
  await git.add(filepath);
  const status = await git.status();
  if (status.staged.length === 0) return false;
  await git.commit(message);
  return true;
}

export async function commitAll(dir, message) {
  const git = simpleGit(dir);
  await git.add('.');
  const status = await git.status();
  if (status.staged.length === 0) return 0;
  await git.commit(message);
  return status.staged.length;
}

export async function push(dir) {
  const git = simpleGit(dir);
  const branch = await getCurrentBranch(dir);
  await git.push('origin', branch, ['--set-upstream']);
}

export async function getUnpushedCount(dir) {
  try {
    const git = simpleGit(dir);
    const result = await git.log(['@{u}..HEAD']);
    return result.total;
  } catch {
    return 1;
  }
}

export async function getRepoSummary(dir) {
  const git = simpleGit(dir);
  const branch = await getCurrentBranch(dir);
  const unpushed = await getUnpushedCount(dir);
  const log = await git.log(['-1']);
  const lastCommit = log.latest;
  return { branch, unpushed, lastCommit };
}