import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const WORDS_FILE = join(dirname(fileURLToPath(import.meta.url)), 'words.json');

// picks one random entry from each of adjectives, nouns, verbs
// and joins them with hyphens.
// e.g. "crimson-walrus-stumbling"
export async function generateBranchName() {
  const raw = await readFile(WORDS_FILE, 'utf8');
  const { adjectives, nouns, verbs } = JSON.parse(raw);
  return [pick(adjectives), pick(nouns), pick(verbs)].join('-');
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}