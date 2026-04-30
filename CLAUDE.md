# CLAUDE.md

Guidance for AI assistants (Claude Code, etc.) working in this repository.

## Project in one sentence

Carmusician is a Vite + TypeScript Progressive Web App that trains musical
ear (intervals, scales, chords) in Italian and English, with a hands-free
voice mode and a "maestro" that picks pre-generated tips from a local JSON
pool — no external LLM call at runtime.

## Entry points

- `src/main.ts` — bootstrap, event delegation, visibility/MediaSession
  hooks. Every `data-action` attribute in `index.html` is routed here.
- `src/app.ts` — `showScreen(id)` + `goHome()`. Each screen has a per-enter
  hook called from `showScreen`.
- `worker/index.ts` — Cloudflare Worker: `/api/tts` (Google Translate
  proxy), else falls through to `env.ASSETS.fetch` (served from `./dist`).
- `src/feedback/maestro-pool.ts` + `src/data/maestro-pool.<locale>.json`
  — pre-generated maestro lines. To regenerate the pool, feed the prompt
  pack in `docs/maestro-explanations-prompt.md` to any capable LLM.

## Non-obvious invariants

- **Singleton mutable state.** `src/utils/state.ts` holds the entire app
  state. Modules read/write their slice directly. Don't wrap it in
  accessors; don't introduce a store abstraction.
- **Generation counter.** Before any async boundary that produces audio or
  TTS, capture `const gen = state.audioGen` and early-return on
  `isStaleGen(gen)` at each resume point. `freshGen()` is called in every
  UI transition (`goHome`, `stopAuto`, `nextQuestion`). Breaking this makes
  leftover audio speak over the next question.
- **Dead-zone mic.** Always `bumpVoiceMute()` after synth/TTS actions. The
  matcher in `src/voice/match-voice.ts` checks `state.voiceMuteUntil`
  before treating a transcript as real input.
- **Shared WebAudio context.** Synth, keep-alive silence, and TTS playback
  all go through the Tone.js `AudioContext`. Do *not* introduce HTMLAudio
  for TTS — that path caused Android Auto stuttering and was deliberately
  removed.
- **No inline handlers.** HTML uses `data-action` / `data-*` attributes and
  delegates to a single body listener in `src/main.ts`.

## Commands

```bash
npm run dev          # vite dev server
npm run typecheck    # tsc --noEmit, strict mode
npm run build        # tsc --noEmit && vite build → dist/
npm run preview      # serve dist/
npx wrangler dev     # run worker + assets locally
npx wrangler deploy  # deploy to Cloudflare
```

Before any commit: `npm run typecheck && npm run build`.

## Branching

Work on topic branches off `Dev`. PRs target `Dev`. Releases are
`Dev → main` merges.

## Secrets

None. The worker only proxies Google Translate TTS and serves static
assets; no API keys required.

## Files that look redundant but are not

- `src/voice/synthesis.ts` exports `getPlayEndTimer/setPlayEndTimer` +
  `getDelayedSpeakTimer/setDelayedSpeakTimer`. These exist so
  `src/audio/control.ts#stopAllAudio` can clear them during a transition
  without a circular import.
- `setTranscriptHandler` (recognition) and `setMediaSessionHandlers`
  (keep-alive) are callback injection points — wired in `src/main.ts` to
  avoid recognition/audio modules importing UI screens.

## Roadmap

- Accelerometer-driven tap gesture for in-car use.
- More locales beyond IT/EN.

## Out of scope

- Adding a UI framework. The app is intentionally vanilla TS with direct
  DOM manipulation.
- Analytics / telemetry.
- Server-side user accounts or a database.
