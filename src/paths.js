import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// project root (for bundled assets like expansions.txt)
export const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// user's home directory
export const HOME_DIR = homedir();

// ~/.gitwrit/ — runtime files only (pid, log, state)
export const GITWRIT_DIR = join(HOME_DIR, '.gitwrit');

// daemon PID — used by start/stop/status to track the process
export const PID_FILE = join(GITWRIT_DIR, 'gitwrit.pid');

// append-only activity log — used by `gitwrit logs`
export const LOG_FILE = join(GITWRIT_DIR, 'gitwrit.log');

// daemon state — persists paused/stopped across sessions
export const STATE_FILE = join(GITWRIT_DIR, 'gitwrit.state');

// global user config — lives at ~/.gitwritrc.json
export const GLOBAL_CONFIG_FILE = join(HOME_DIR, '.gitwritrc.json');

// local directory config — lives at <watched-dir>/.gitwrit.json
export const LOCAL_CONFIG_FILENAME = '.gitwrit.json';