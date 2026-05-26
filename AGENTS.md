# AGENTS.md

Guidelines for contributors and coding agents working in this repository.

## Project Intent

- This is a personal Chrome extension toolkit.
- Prioritize practical, fast-to-iterate features that match the owner's workflow.
- Keep implementation simple and easy to remove if a feature is no longer needed.

## Core Architecture

- Chrome Extension: Manifest V3.
- No build step is required; code runs directly as plain `js`, `html`, and `css`.
- Features should be isolated and mostly self-contained.
- Current repository includes legacy root-level scripts; prefer feature-scoped organization for new work.

## Folder and File Conventions

- Put each new feature in its own folder under `features/`.
- Suggested structure:

```text
features/
  <feature-name>/
    README.md
    content-script.js
    styles.css            # optional
    popup.html            # optional
    popup.js              # optional
```

- Use kebab-case for folder and file names (example: `youtube-watch-later-button`).
- Keep feature assets near the feature, unless they are shared globally.
- Use root-level files only for truly shared extension surfaces:
  - `manifest.json`
  - global popup entry (`popup.html`, `popup.js`) if still shared
  - global new-tab entry (`newtab.html`, `newtab.js`, `newtab.css`) if still shared

## Manifest Rules

- Every new feature must be explicitly wired in `manifest.json`.
- Keep match patterns narrow and feature-specific whenever possible.
- Use the minimum permissions and host permissions needed.
- If a feature is optional/temporary, keep it easy to remove by grouping related manifest entries.

## Coding Rules

- Follow existing style in nearby files; do not introduce new frameworks or tooling without a strong reason.
- Prefer defensive DOM code for content scripts:
  - guard for missing elements
  - avoid hard crashes on UI changes
  - re-run logic safely on SPA navigation where needed
- Keep each feature independent; avoid hidden coupling across feature folders.
- Namespace `chrome.storage` keys per feature (example: `domainBlocker.*`).
- Add brief comments only where logic is non-obvious.

## Quality Bar

- Keep features lightweight and performant on frequently visited pages.
- Avoid noisy logs in production behavior.
- Test manually in Chrome before finalizing:
  - `chrome://extensions` -> Load unpacked
  - verify feature behavior on target domains
  - verify no regressions in popup/new-tab/background flows

## Change Management

- Do not run `git add` or `git commit` as part of automated agent work.
- Do not refactor unrelated features in the same change.
- Prefer small, reversible edits focused on one feature at a time.
