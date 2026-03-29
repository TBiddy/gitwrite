# gitwrit Extensions

gitwrit is designed to be extended. This document describes the three supported extension surfaces, how they work, and how to build one.

Extensions are loaded from your `~/.gitwritrc.json` config under an `"extensions"` key:

```json
{
  "extensions": [
    "gitwrit-latex",
    "./my-local-extension.js"
  ]
}
```

Each value is either an npm package name or a path to a local file. Extensions are loaded at daemon startup.

---

## Extension surfaces

### 1. File type watchers

By default, gitwrit watches `.md` and `.mdx` files. A file type watcher extension adds support for additional file types — without the user having to manage anything manually.

**Example use cases:**
- `.tex` files for LaTeX writers and academics
- `.ipynb` files for Jupyter Notebook users
- `.org` files for Emacs Org Mode users
- `.adoc` files for AsciiDoc documentation

**Interface:**

```js
// my-extension.js
export default {
  type: 'fileWatcher',
  name: 'gitwrit-latex',
  fileTypes: ['.tex', '.bib'],

  // optional: transform the file before committing
  // return null to skip committing this file
  async beforeCommit({ filepath, content }) {
    return { filepath, content };
  },
};
```

The `fileTypes` array is merged with the user's configured file types at daemon startup. The optional `beforeCommit` hook lets you inspect or transform content before it is staged — useful for stripping build artifacts or normalizing line endings.

---

### 2. Commit message formatters

By default, gitwrit generates commit messages in the format:

```
auto: notes/ideas.md
```

A commit message formatter extension lets you customize that — per project, per file type, or however you like.

**Example use cases:**
- Include a timestamp or session branch name in every message
- Generate semantic commit messages based on file content (e.g. using an AI API)
- Use a team-specific commit format

**Interface:**

```js
export default {
  type: 'commitFormatter',
  name: 'gitwrit-semantic',

  // receives context about the file being committed
  // must return a string — the commit message
  async formatMessage({ filepath, dir, branch, timestamp }) {
    const short = filepath.replace(dir, '').replace(/^\//, '');
    return `docs(auto): update ${short} [${branch}]`;
  },
};
```

Only one commit formatter is active at a time. If multiple are loaded, the last one wins.

---

### 3. Output integrations

An output integration runs after a successful push. It receives information about what was pushed and can trigger downstream actions — sending a notification, posting to a webhook, updating a log, or anything else.

**Example use cases:**
- Post a Slack message when a document is updated
- Trigger a CI build after pushing documentation
- Log push events to an external monitoring service
- Send a desktop notification via the OS notification API

**Interface:**

```js
export default {
  type: 'outputIntegration',
  name: 'gitwrit-slack',

  // called after every successful push
  // return value is ignored
  async afterPush({ dir, branch, commitCount, pushedAt }) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `gitwrit pushed ${commitCount} commit(s) from ${branch}`,
      }),
    });
  },
};
```

Multiple output integrations can be active simultaneously. They run in sequence after each push.

---

## Publishing an extension

Extensions are standard npm packages. To publish one:

1. Name your package with the `gitwrit-` prefix (e.g. `gitwrit-latex`, `gitwrit-slack`)
2. Export a default object matching one of the interfaces above
3. Publish to npm: `npm publish`

Users install it like any other package:

```sh
npm install -g gitwrit-latex
```

And register it in their config:

```json
{
  "extensions": ["gitwrit-latex"]
}
```

---

## Things to keep in mind

- Extensions run inside the daemon process — unhandled errors can crash the watcher. Wrap async operations in `try/catch`.
- The daemon restarts automatically on `gitwrit restart` — extensions are reloaded each time.
- If you are building an output integration that calls an external API, make it resilient to network failures. A failed push notification should never block the commit cycle.
- Keep extensions focused. One extension, one concern.

---

## Listing your extension

Once your extension is published and working, open a pull request to add it to the [community extensions list](https://github.com/TBiddy/gitwrit/wiki/Extensions). Include the package name, a one-line description, and which extension surface it uses.
