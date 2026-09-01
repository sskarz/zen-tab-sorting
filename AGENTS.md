# Repository Guidelines

## Project Structure & Module Organization

This repository is a compact Zen Browser mod with no build system or dependency tree.

- `tidy-tabs.uc.js` handles OpenRouter requests, response validation, tab-group mutations, rollback, UI injection, and event hooks.
- `tests/tidy-tabs.test.cjs` exercises pure request and validation helpers with Node's built-in test runner.
- `userChrome.css` styles the separator, sort button, and sorting animations.
- `theme.json` is the mod manifest and declares the Advanced Tab Groups integration.
- `image.png` and `README.md` provide marketplace artwork and the short project description.

Keep behavior in the user script and presentation in the stylesheet. When adding a file used by the installed mod, register it in `theme.json`.

## Build, Test, and Development Commands

There is no compilation or package installation step. Before submitting changes, run:

```sh
node --check tidy-tabs.uc.js
node --test
python3 -m json.tool theme.json >/dev/null
git diff --check
```

These commands validate syntax, pure helper behavior, manifest JSON, and whitespace. Test the installed mod manually in a supported Zen Browser profile with Advanced Tab Groups available.

## Coding Style & Naming Conventions

Follow the existing two-space indentation. JavaScript uses semicolons, double-quoted strings, `camelCase` for functions and variables, and `UPPER_SNAKE_CASE` keys in `CONFIG`. Prefer guarded access to Firefox/Zen globals such as `gBrowser`, `Services`, and `gZenWorkspaces`; these APIs may not exist during startup. Keep DOM selectors and log prefixes consistent with nearby code. Use kebab-case CSS class names and preserve theme-aware colors through `currentColor` or `light-dark()`.

## Testing & Security Guidelines

Add dependency-free `node:test` cases for request-contract or validation changes. Manually verify prompt cancellation, 401 key clearing, timeouts, stale workspaces, exclusions, selected-tab preservation, complete regrouping, and rollback. UI changes should include light- and dark-theme screenshots when relevant.

Never log or commit API keys, authorization headers, prompts, tab titles, hostnames, or raw responses. Requests may contain only temporary IDs, visible titles, hostnames, and current group names. Preserve strict schema, ZDR, denied data collection, and no-mutation-on-failure behavior.

## Commit & Pull Request Guidelines

Recent history favors short imperative subjects, often Conventional Commit prefixes such as `fix:`, `feat:`, and `chore:`. Keep each commit focused; for example, `fix: preserve pinned tabs during sorting`. Pull requests should explain the user-visible effect, list manual verification steps, link related issues, and include screenshots or a short recording for visual changes. Call out any required Zen version, preference, or manifest change.
