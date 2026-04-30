# ♫ CarMusician

CarMusician is a free web app for training your musical ear (intervals, scales, chords) **without using your hands**: you speak, it responds. It was built to make use of idle time in the car — hands-free active, microphone always listening — and it's made entirely with **vibe coding**. It's an experimental and amateur project, so be patient and share your feedback to help me make it even better!

Supported languages: **Italian** and **English**

## Key Features

- **Interval, scale, and chord quizzes** — four difficulty levels (easy, medium, hard, custom) with a scale selector for custom mode.
- **Auto Training** — passive mode: plays → announces → repeats → explains → pauses, in a continuous loop. Designed for listening in the car.
- **Hands-free voice commands** in Italian and English: *intervals, chords, scales, auto training* to navigate; *next, replay, quiet* in the quiz; *easy / medium / hard / custom* to change level; *back* to return to the menu; *close app* to end the session.
- **Maestro** — brief, qualitative comments (color, feeling, references to famous songs) on wrong answers and every third consecutive correct answer. Phrases are **pre-generated**: no external API calls at runtime, no account, no cost.
- **Persistent statistics** — totals, accuracy, active days, streak record, last 14 days chart, breakdown by individual interval/scale/chord.
- **Reference screen** — listen to every scale and every interval for comparison, with a short description.
- **Natural TTS voices** — Google Translate TTS (proxied via Cloudflare Worker to avoid CORS) with fallback to the device voice.
- **Installable PWA**, works offline after the first load.

---

# For Musicians

CarMusician is **free** and designed to be used while doing something else. All you need is a microphone and speakers: your car's hands-free system works great, but it also works from a PC, tablet, or headset with a mic.

## How to Use It

1. Open the web app from your phone or PC browser. Chrome works best as it natively supports the browser's voice recognition.
2. Tap the amber circle in the center of the home screen. You'll be asked for microphone permission — accept it.
3. Say what you want to train: *intervals*, *chords*, *scales*, or *auto training*. Or tap the corresponding card.
4. During the quiz, simply say the name of the answer: "perfect fifth", "major third", "melodic minor"… CarMusician will match it even if you use variants ("fifth" alone is enough).
5. To change difficulty on the fly: *easy*, *medium*, *hard*. For scales there's also *custom*, where you choose which scales to include.
6. To return to exercise selection: *back*. To turn everything off: *close app*.

## Sharing and Modifications

You're free to share the link, install it as an app on your phone (from the browser menu), and fork the code to adapt it to your needs — the MIT license explicitly allows it.

## Feedback

Feedback is welcome. Open an issue on GitHub or write to me: this literally started because I needed it myself — everything that makes it useful to others is a bonus.

---

# For Developers

## Stack

- **Vite 5** + **TypeScript 5** (strict mode) — bundler, zero framework.
- **Tone.js** — synth (PolySynth triangle8) and Salamander piano sampler.
- **vite-plugin-pwa** — service worker (Workbox) with runtime caching for Google Fonts and piano samples.
- **Cloudflare Workers with Static Assets** — serves `dist/` and proxies `/api/tts` → Google Translate TTS (nothing else; no secrets required).

## Project Structure

```
carmusician/
├── index.html              app shell (screen markup, zero inline JS)
├── styles/                 main.css · components.css · screens.css
├── src/
│   ├── main.ts             bootstrap + event delegation
│   ├── app.ts              router (showScreen, goHome, closeApp)
│   ├── types.ts            domain types
│   ├── i18n/               runtime dictionary (en.ts, it.ts, types.ts,
│   │                       index.ts with auto-detect locale + reload)
│   ├── data/               intervals, scales, chords, notes
│   │                       maestro-pool.{en,it}.json (maestro pool)
│   ├── audio/              synth, player, keep-alive, wake-lock, control
│   ├── voice/              synthesis (TTS), recognition (STT), match-voice
│   ├── stats/              persistent (localStorage) + settings
│   ├── feedback/           maestro-pool (row selection), quiz-feedback
│   ├── ui/
│   │   ├── screens/        welcome, home, quiz, auto-training, reference,
│   │   │                   settings, stats
│   │   └── components/     stats-bar, play-btn, difficulty-selector,
│   │                       question-pools
│   └── utils/              state (mutable singleton), dom helpers
├── worker/index.ts         Cloudflare Worker (only /api/tts + assets)
├── docs/
│   └── maestro-explanations-prompt.md   prompt pack for regenerating the pool
├── public/                 icon-192.png, icon-512.png
├── wrangler.toml           main = worker/index.ts · assets = ./dist
└── vite.config.ts          PWA + alias @/* → src/*
```

## Development

```bash
npm install
npm run dev          # vite dev server on :5173
npm run typecheck    # tsc --noEmit (strict)
npm run build        # tsc --noEmit && vite build → dist/
npm run preview      # serve dist/ locally
npx wrangler dev     # worker + assets locally
```

Browser voice recognition (Web Speech API) runs on Chrome (desktop and Android). The microphone requires a secure context: localhost or HTTPS. Does not work from `file://`.

## Non-Obvious Invariants

- **Mutable singleton state.** `src/utils/state.ts` holds the entire app state. Modules read/write their own slice directly; no store/accessor.
- **Generation counter.** Before every async boundary that produces audio or TTS: `const gen = state.audioGen` + early-return on `isStaleGen(gen)` at every resume point. `freshGen()` is called on every UI transition (goHome, stopAuto, nextQuestion). If you break this, residual audio will talk over the next question.
- **Mic dead-zone.** `bumpVoiceMute()` after every synth/TTS. The matcher in `src/voice/match-voice.ts` checks `state.voiceMuteUntil` before treating a transcript as real input.
- **Shared AudioContext.** Synth, keep-alive silence, and TTS all run on the Tone.js context. Do not introduce HTMLAudio for TTS (it caused stuttering on Android Auto and was intentionally removed).
- **No inline handlers.** The HTML uses `data-action`/`data-*`; a single listener in `src/main.ts` delegates everything.

## Deploy (Cloudflare)

```bash
npm run build
npx wrangler deploy
```

## Updating Maestro Phrases

The maestro makes no API calls at runtime: every response is drawn from a pre-generated pool in:

- `src/data/maestro-pool.it.json`
- `src/data/maestro-pool.en.json`

### Schema

Each pool is an object with this shape (the `abbr` values correspond to those in `src/data/{intervals,scales,chords}.ts`):

```json
{
  "locale": "it" | "en",
  "intervals": {
    "<abbr>": {
      "ascending":  ["line 1", "..."],
      "descending": ["line 1", "..."],
      "harmonic":   ["line 1", "..."]
    }
  },
  "scales": { "<abbr>": ["line 1", "..."] },
  "chords": { "<abbr>": ["line 1", "..."] }
}
```

### How to Generate New Phrases

The file [`docs/maestro-explanations-prompt.md`](./docs/maestro-explanations-prompt.md) is a **self-contained prompt pack**: it contains the style rules (tone, length, references), the full list of combinations to cover (13 intervals × 3 directions + 12 scales + 10 chords), and the famous song anchors. Paste it into any capable LLM (Claude, GPT, Gemini…), run it twice — once with `TARGET_LOCALE = it`, once with `TARGET_LOCALE = en` — and replace the contents of both JSON files with the output.

Style rules in summary (enforced by the prompt):

- Warm, telegraphic tone. One or two sentences, never lists.
- Focus on color and feeling, never count semitones or number degrees.
- Song references only if globally famous.
- Plain-text TTS-speakable: no markdown, emojis, or quotation marks.
- Default 20 words max. Up to 40 only when citing a song.

### Manual Addition/Editing

You can also write lines by hand. The `pickConfusedLine` / `pickExplainLine` functions in `src/feedback/maestro-pool.ts` read the arrays defensively and return `null` if a bucket is empty, showing the "Not available" placeholder in the UI.

## License

MIT — © 2026 veeto-m. See [LICENSE](./LICENSE).

---

# ♫ CarMusician

CarMusician è una web app gratuita per allenare l'orecchio musicale
(intervalli, scale, accordi) **senza usare le mani**: parli, lei ti risponde.
È nata per sfruttare il tempo morto in auto — vivavoce attivo, microfono
sempre in ascolto — ed è fatta interamente in **vibe coding**.
E' un progetto sperimentale e amatoriale, sii paziente e condividi il tuo
feedback per aiutarmi a renderla ancora migliore!

Lingue supportate: **Italiano** e **Inglese**

## Caratteristiche principali

- **Quiz di intervalli, scale e accordi** — quattro livelli di difficoltà
  (facile, medio, difficile, custom) con selettore delle scale per la
  modalità custom.
- **Auto Training** — modalità passiva: suona → annuncia → ripete → ti
  spiega → pausa, a ciclo continuo. Pensata per ascolto in auto.
- **Comandi vocali hands-free** in italiano e inglese:
  *intervalli, accordi, scale, auto training* per navigare; *avanti,
  riascolta, zitto* nel quiz; *facile / medio / difficile / custom* per
  cambiare livello; *indietro* per tornare al menù; *chiudi app* per
  terminare la sessione.
- **Maestro** — commenti brevi e qualitativi (colore, sensazione, riferimenti
  a canzoni famose) sulle risposte sbagliate e a ogni terza risposta giusta
  consecutiva. Le frasi sono **pre-generate**: niente chiamate ad API esterne
  a runtime, niente account, nessun costo.
- **Statistiche persistenti** — totali, accuratezza, giorni attivi, streak
  record, grafico ultimi 14 giorni, dettaglio per singolo intervallo/scala/
  accordo.
- **Schermata Reference** — ascolti ogni scala e ogni intervallo per
  confronto, con descrizione breve.
- **Voci TTS naturali** — Google Translate TTS (proxy-ato via Cloudflare
  Worker per evitare CORS) con fallback alla voce del dispositivo.
- **PWA installabile**, funziona offline dopo il primo caricamento. 

---

# Per i musicisti

CarMusician è **gratuita** e pensata per essere usata mentre fai altro.
Basta avere un microfono e degli altoparlanti: il vivavoce della tua auto
va benissimo, ma funziona anche da PC, tablet o cuffie con mic.

## Come si usa

1. Apri la web app dal browser del tuo telefono o PC. Chrome funziona al
   meglio perché è quello che supporta nativamente il riconoscimento
   vocale del browser.
2. Tappa il cerchio ambra al centro della schermata iniziale. Ti verrà
   chiesto il permesso per usare il microfono — accetta.
3. Dì cosa vuoi allenare: *intervalli*, *accordi*, *scale* o *auto
   training*. Oppure tappa la card corrispondente.
4. Durante il quiz, di' semplicemente il nome della risposta: "quinta
   giusta", "terza maggiore", "minore melodica"… CarMusician la matcha
   anche se usi varianti ("quinta" sola basta).
5. Se vuoi cambiare difficoltà al volo: *facile*, *medio*, *difficile*.
   Per le scale c'è anche *custom*, dove scegli tu quali scale includere.
6. Per tornare alla selezione esercizio: *indietro*. Per spegnere tutto:
   *chiudi app*.

## Condivisione e modifiche

Puoi distribuire liberamente il link, installarla come app sul telefono
(dal menù del browser) e fare fork del codice per adattarla ai tuoi
scopi — la licenza MIT lo permette esplicitamente.

## Feedback

I feedback sono i benvenuti. Apri una issue su GitHub o scrivimi: è
letteralmente nata perché mi serviva, tutto quello che la rende utile ad
altri è bonus.

---

# Per i programmatori

## Stack

- **Vite 5** + **TypeScript 5** (strict mode) — bundler, zero framework.
- **Tone.js** — synth (PolySynth triangle8) e sampler piano Salamander.
- **vite-plugin-pwa** — service worker (Workbox) con runtime caching per
  Google Fonts e i sample del piano.
- **Cloudflare Workers with Static Assets** — serve `dist/` e proxy
  `/api/tts` → Google Translate TTS (nient'altro; nessun segreto
  richiesto).

## Struttura del progetto

```
carmusician/
├── index.html              app shell (markup degli screen, zero JS inline)
├── styles/                 main.css · components.css · screens.css
├── src/
│   ├── main.ts             bootstrap + event delegation
│   ├── app.ts              router (showScreen, goHome, closeApp)
│   ├── types.ts            tipi di dominio
│   ├── i18n/               dizionario runtime (en.ts, it.ts, types.ts,
│   │                       index.ts con auto-detect locale + reload)
│   ├── data/               intervals, scales, chords, notes
│   │                       maestro-pool.{en,it}.json (pool maestro)
│   ├── audio/              synth, player, keep-alive, wake-lock, control
│   ├── voice/              synthesis (TTS), recognition (STT), match-voice
│   ├── stats/              persistent (localStorage) + settings
│   ├── feedback/           maestro-pool (selezione riga), quiz-feedback
│   ├── ui/
│   │   ├── screens/        welcome, home, quiz, auto-training, reference,
│   │   │                   settings, stats
│   │   └── components/     stats-bar, play-btn, difficulty-selector,
│   │                       question-pools
│   └── utils/              state (singleton mutabile), dom helpers
├── worker/index.ts         Cloudflare Worker (solo /api/tts + assets)
├── docs/
│   └── maestro-explanations-prompt.md   prompt pack per rigenerare il pool
├── public/                 icon-192.png, icon-512.png
├── wrangler.toml           main = worker/index.ts · assets = ./dist
└── vite.config.ts          PWA + alias @/* → src/*
```

## Sviluppo

```bash
npm install
npm run dev          # vite dev server su :5173
npm run typecheck    # tsc --noEmit (strict)
npm run build        # tsc --noEmit && vite build → dist/
npm run preview      # serve dist/ localmente
npx wrangler dev     # worker + assets in locale
```

Il riconoscimento vocale del browser (Web Speech API) gira su Chrome
(desktop e Android). Il microfono richiede contesto sicuro: localhost o
HTTPS. Non funziona da `file://`.

## Invarianti non ovvie

- **Stato mutabile singleton.** `src/utils/state.ts` contiene l'intero
  stato dell'app. I moduli leggono/scrivono la propria fetta
  direttamente; niente store/accessor.
- **Contatore di generazione.** Prima di ogni boundary async che produce
  audio o TTS: `const gen = state.audioGen` + early-return su
  `isStaleGen(gen)` a ogni resume point. `freshGen()` viene chiamato in
  ogni transizione UI (goHome, stopAuto, nextQuestion). Se lo rompi,
  audio residuo parla sopra la domanda successiva.
- **Mic dead-zone.** `bumpVoiceMute()` dopo ogni synth/TTS. Il matcher in
  `src/voice/match-voice.ts` controlla `state.voiceMuteUntil` prima di
  trattare un transcript come input reale.
- **AudioContext condiviso.** Synth, silenzio keep-alive e TTS girano
  tutti sul contesto Tone.js. Non introdurre HTMLAudio per il TTS
  (causava stuttering su Android Auto, rimosso intenzionalmente).
- **Nessun handler inline.** L'HTML usa `data-action`/`data-*`; un
  singolo listener in `src/main.ts` delega tutto.

## Deploy (Cloudflare)

```bash
npm run build
npx wrangler deploy
```
## Aggiornare le frasi del maestro

Il maestro non chiama alcuna API a runtime: ogni risposta pesca da un
pool pre-generato in:

- `src/data/maestro-pool.it.json`
- `src/data/maestro-pool.en.json`

### Schema

Ogni pool è un oggetto con questa forma (gli `abbr` corrispondono a
quelli in `src/data/{intervals,scales,chords}.ts`):

```json
{
  "locale": "it" | "en",
  "intervals": {
    "<abbr>": {
      "ascending":  ["riga 1", "..."],
      "descending": ["riga 1", "..."],
      "harmonic":   ["riga 1", "..."]
    }
  },
  "scales": { "<abbr>": ["riga 1", "..."] },
  "chords": { "<abbr>": ["riga 1", "..."] }
}
```

### Come generare nuove frasi

Il file [`docs/maestro-explanations-prompt.md`](./docs/maestro-explanations-prompt.md)
è un **prompt pack self-contained**: contiene le regole di stile (tono,
lunghezza, riferimenti), la lista completa delle combinazioni da coprire
(13 intervalli × 3 direzioni + 12 scale + 10 accordi) e gli anchor delle
canzoni famose. Incollalo in qualunque LLM capace (Claude, GPT,
Gemini…), fallo girare due volte — una con `TARGET_LOCALE = it`, una con
`TARGET_LOCALE = en` — e sostituisci il contenuto dei due JSON con
l'output.

Regole di stile in sintesi (applicate dal prompt):

- Tono caldo, telegrafico. Una o due frasi, mai liste.
- Focus su colore e sensazione, mai contare semitoni o numerare gradi.
- Riferimenti a canzoni solo se globalmente famose.
- Plain-text TTS-speakable: niente markdown, emoji, virgolette.
- Default 20 parole max. Fino a 40 solo se si cita una canzone.

### Aggiunta/modifica manuale

Puoi anche scrivere righe a mano. Le funzioni `pickConfusedLine` /
`pickExplainLine` in `src/feedback/maestro-pool.ts` leggono gli array in
modo difensivo e ritornano `null` se una bucket è vuota, mostrando il
placeholder "Non disponibile" in UI.

## Licenza

MIT — © 2026 veeto-m. Vedi [LICENSE](./LICENSE).
