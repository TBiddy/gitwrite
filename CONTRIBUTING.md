# Contributing to gitwrit

Thank you for your interest in contributing. **gitwrit** is built for people who write seriously, and contributions that share that spirit are welcome at every level—from adding a single word to the branch name lists, to building new file type support, to improving the core daemon. We also acknowledge that mentioning *spirits* and *daemons* in the same sentence is a little *spooky*, but we assure you that was the last *daemon* joke in this documentation.

---

## Ways to contribute

### Word lists

gitwrit generates session branch names by combining one word from each of three lists in `src/words.json` — adjectives, nouns, and verbs. The result looks like `crimson-walrus-stumbling` or `teal-fox-bouncing`.

Adding words is one of the lowest-barrier contributions possible. Just open a pull request against `src/words.json`. A few guidelines:

- Keep words to one or two syllables — they read better in a branch name
- Verbs should be present participle (`-ing` form)
- Avoid words that are offensive, gendered, or culturally loaded
- Aim for words that are vivid and a little unexpected — `spatula` and `narwhal` are more interesting than `table` and `fish`

### Extensions

gitwrit is designed to be extended. See [EXTENSIONS.md](EXTENSIONS.md) for documentation on the three supported extension surfaces:

- **File type watchers** — add support for new file types beyond Markdown
- **Commit message formatters** — customize how commit messages are generated
- **Output integrations** — trigger actions after a successful push

### Bug fixes and improvements

If you see something broken, please open an issue first so we can align on a fix before you spend too much time on a pull request. For small, obvious fixes, a direct PR is fine.

### New commands or flags

The commands are intentionally minimal. Please open an issue to discuss before building—we want to make sure new commands help keep them simple and easy to use.

---

## Setup

```sh
git clone https://github.com/TBiddy/gitwrit
cd gitwrit
npm install
```

Verify everything works:

```sh
npm test                     # run the integration test suite
node bin/gitwrit.js help     # smoke test the CLI
```

---

## Project structure

```
gitwrit/
├── bin/
│   └── gitwrit.js           ← CLI entry point
├── src/
│   ├── commands/            ← one file per command
│   ├── banner.js            ← ASCII art banner + teal/pink gradient
│   ├── daemon.js            ← background watcher process
│   ├── expansions.js        ← branch name generation
│   ├── git.js               ← all Git operations
│   ├── logger.js            ← activity log
│   ├── notify.js            ← native OS push failure notifications
│   ├── paths.js             ← shared path constants
│   ├── scheduler.js         ← periodic push logic
│   ├── settings.js          ← global + local config
│   ├── state.js             ← daemon state (running/paused/stopped)
│   ├── ui.js                ← shared display helpers + teal/pink palette
│   ├── updater.js           ← npm update checker (24hr cache)
│   ├── watcher.js           ← chokidar file watching
│   └── words.json           ← adjective/noun/verb word lists
├── test/
│   └── integration.test.js  ← integration tests (node:test, no framework)
└── README.md
```

A few things worth knowing before you dig in:

- **ESM throughout** — `"type": "module"` in `package.json`, no CommonJS
- **All Git operations live in `src/git.js`** — nothing else calls `simple-git` directly
- **All display primitives live in `src/ui.js`** — nothing else calls `chalk` directly
- **All path constants live in `src/paths.js`** — nothing hardcodes `~/.gitwrit` anywhere else
- **The daemon is just `gitwrit __daemon`** — a hidden subcommand, not a separate binary; `start.js` spawns it detached

---

## Code style

- Please keep it readable so future contributors understand what a function does without reading the whole file
- Comment the *why*, not the *what*
- One concern per file — if a file is growing, it probably wants to be split
- Proof your CLI output — copy and terminal output are part of the product; read your output before submitting
- **Important:** It is absolutely fine to use AI tools for commits, as this was also built with the help of Claude Code.

---

## Submitting a pull request

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `npm test` — all tests must pass
4. Open a pull request with a clear description of what changed and why
5. If your PR changes CLI output, include a screenshot or terminal recording

---

## Opening an issue

If something is not working, please include:

- Your OS and Node.js version (`node --version`)
- The command you ran
- What you expected vs. what happened
- The output of `gitwrit logs` if the daemon was involved

---

## Code of conduct

Please be kind. 🙏 gitwrit is built for a broad audience — engineers, researchers, writers, students. Contributions and conversations should be welcoming to all of them. Humor is welcome as long as it is inclusive.

---

## License

By contributing, you agree that your contributions will be licensed under the MIT license.