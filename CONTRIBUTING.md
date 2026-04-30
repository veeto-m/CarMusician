# Contributing

Thanks for your interest in improving Carmusician. This project is small and
opinionated — please follow the conventions below.

## Branching model

- `main` — release branch. Protected; only merges from `Dev` are expected
  here, tied to a tagged release.
- `Dev` — integration branch. All feature work merges here first.
- `feat/<short-slug>`, `fix/<short-slug>`, `chore/<short-slug>` — topic
  branches, created off `Dev`, merged back via pull request.

Open PRs target `Dev`. A release is a `Dev → main` merge.

## Commit messages

Conventional Commits:

- `feat: add custom scale picker`
- `fix: stop stale async speak after goHome`
- `refactor: extract voice module`
- `chore: bump deps`
- `docs: update README setup`

Keep each commit focused. Separate refactors from behavior changes.

## Code style

- **TypeScript strict** — no implicit any, no unused locals. `npm run
  typecheck` must pass.
- **No inline event handlers in HTML.** Markup uses `data-action` / `data-*`
  attributes and handlers are wired in `src/main.ts` via event delegation.
- **Mutable state lives in `src/utils/state.ts`.** Modules read/write the
  slice they own; there are no getter/setter wrappers.
- **Generation counter.** Any async audio callback (speak, playEndTimer,
  delayed speak, AI fetch) must capture `state.audioGen` at start and bail
  early if `isStaleGen(gen)` — this is what keeps the next question from
  being overrun by a leftover announcement.
- **Dead-zone mic.** `bumpVoiceMute()` after every synth / TTS action; the
  voice matcher checks `state.voiceMuteUntil` before acting.
- **No new features in a refactor PR.** Zero-functional-change refactors
  must demonstrably keep the UI identical.

## Before opening a PR

```bash
npm run typecheck
npm run build
```

Describe in the PR body:

- What changed, and the *why* (link an issue if relevant).
- Anything the reviewer should test manually, especially on a phone.
- Any migration notes (`CACHE_NAME` bumps, new env vars, wrangler changes).

## Reporting bugs

Open an issue with: device/browser, reproduction steps, expected vs actual
behavior, and (if possible) the console output captured from the in-app
`debug` overlay.
