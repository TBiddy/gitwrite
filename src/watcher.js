import chokidar from 'chokidar';

// ─── watcher factory ──────────────────────────────────────────────────────────

// starts a chokidar watcher on the given paths, filtered to fileTypes.
// calls onSave(filepath, dir) after the per-file debounce window.
export function createWatcher({ paths, fileTypes, debounce, onSave }) {
  // build a glob pattern for each watched path
  const globs = paths.map(p => `${p}/**/*`);

  const watcher = chokidar.watch(globs, {
    ignored: [
      /(^|[/\\])\../,   // dotfiles
      /node_modules/,
      /\.git/,
    ],
    persistent:          true,
    ignoreInitial:       true,
    awaitWriteFinish: {
      stabilityThreshold: 200,  // wait 200ms for the write to fully flush
      pollInterval:       100,
    },
  });

  // per-file debounce timers — each file gets its own timer
  const timers = new Map();

  function handleChange(filepath) {
    // only act on files matching the configured types
    const matches = fileTypes.some(ext => filepath.endsWith(ext));
    if (!matches) return;

    // find which watched directory this file belongs to
    const dir = paths.find(p => filepath.startsWith(p));
    if (!dir) return;

    // reset the timer for this specific file
    if (timers.has(filepath)) clearTimeout(timers.get(filepath));

    const timer = setTimeout(() => {
      timers.delete(filepath);
      onSave(filepath, dir);
    }, debounce);

    timers.set(filepath, timer);
  }

  watcher.on('add',    handleChange);
  watcher.on('change', handleChange);

  return {
    close: () => watcher.close(),
    // re-attach watchers after sleep — called on SIGCONT
    restart: () => {
      watcher.close();
      return createWatcher({ paths, fileTypes, debounce, onSave });
    },
  };
}