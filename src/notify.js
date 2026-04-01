import { exec } from 'child_process';
import { platform } from 'os';

// ─── native notification ───────────────────────────────────────────────────────
//
// fires a native OS notification with no npm dependencies.
// macOS  → osascript
// Linux  → notify-send (degrades silently if not installed)
// other  → silent, no crash
//
// only called in two places:
//   1. scheduler.js  — on push failure (always notify)
//   2. nowhere else  — stop summary lives in the terminal output only

export function notify(title, message) {
  const os = platform();

  // sanitize inputs — prevent shell injection via single-quote stripping
  const safeTitle   = title.replace(/'/g, '');
  const safeMessage = message.replace(/'/g, '');

  if (os === 'darwin') {
    exec(
      `osascript -e 'display notification "${safeMessage}" with title "${safeTitle}"'`,
      () => {} // ignore errors — notification is best-effort
    );
  } else if (os === 'linux') {
    exec(
      `notify-send "${safeTitle}" "${safeMessage}" 2>/dev/null`,
      () => {}
    );
  }
  // windows + anything else — silent
}