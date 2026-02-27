# AGENTS.md

## Cursor Cloud specific instructions

This is a **zero-dependency static web application** — a single `index.html` file (~5200 lines) with all HTML, CSS, and JavaScript inline, plus two helper JS files (`auto-backup.js`, `simple-github-sync.js`). There is no package manager, no build system, no backend server, and no automated test suite.

### Running the application

Serve the workspace root with any static HTTP server:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` in Chrome.

### Key caveats

- **No lint, test, or build commands exist.** There is no `package.json`, no linter config, and no test framework. Validation is done manually via the browser.
- **All data is stored in browser localStorage.** There is no database or backend API.
- The UI language mixes English (labels, headings) and Chinese (some modal text, button labels). This is intentional.
- GitHub sync (`simple-github-sync.js`) is optional and requires a personal access token configured in-app; it is not needed for local development.
