# Maestro explanations — LLM generation guide

This file is a self-contained prompt pack to feed into any capable LLM
(Claude, GPT, Gemini…) in order to pre-generate a **pool of offline
maestro lines** for every interval, scale and chord used in the app.

Why: the roadmap item "Pre-fetched offline maestro lines to reduce API
calls" (see `CLAUDE.md`). At runtime the app hits `/api/maestro` for a
fresh line. Shipping a static pool lets the client pick one locally when
offline, or when the user just wants lower latency.

## Style contract (must match the runtime)

The lines must sound exactly like the live maestro — the runtime system
prompt is the source of truth. Summary:

- Warm, telegraphic teacher. One or two sentences, never lists.
- Focus on **color and feel**, never count semitones, never name
  scale degrees by number.
- Never tease the user; tone of a friend helping out.
- Song references **only if extremely globally famous** (Happy
  Birthday, Star Wars theme, Jaws, Für Elise, Fra Martino…). When in
  doubt, none.
- Plain TTS-speakable text only — no markdown, no emoji, no lists, no
  quotation marks around song titles.
- Each line must have a different opening and angle from siblings in
  the same pool.
- Default length: **max 20 words**. Allowed up to **40 words only when
  the line cites a famous song** (never longer).

## Output format

Return **one JSON document**, ready to commit under
`src/data/maestro-pool.<locale>.json`. Schema:

```json
{
  "locale": "it" | "en",
  "intervals": {
    "<abbr>": {
      "ascending": ["line 1", "line 2", ...],
      "descending": ["line 1", ...],
      "harmonic":   ["line 1", ...]
    },
    ...
  },
  "scales": {
    "<abbr>": ["line 1", "line 2", ...]
  },
  "chords": {
    "<abbr>": ["line 1", "line 2", ...]
  }
}
```

For each bucket produce **8 distinct lines**. No duplicates, no
near-paraphrases. Mix angles: one-word color, metaphor, emotional
texture, famous-song reference (sparingly), memory hook, movement
description.

Do not restate the item's name verbatim in every line — vary.

## Dataset to cover

The app uses the identifiers below as keys. Names are the user-facing
label in each locale; your output must key by the *abbr*, not the name.

### Intervals (`abbr` → semitones, human name)

| abbr | semitones | IT name            | EN name            |
|------|-----------|--------------------|--------------------|
| 1    | 0         | Unisono            | Unison             |
| 2m   | 1         | Seconda minore     | Minor second       |
| 2M   | 2         | Seconda maggiore   | Major second       |
| 3m   | 3         | Terza minore       | Minor third        |
| 3M   | 4         | Terza maggiore     | Major third        |
| 4    | 5         | Quarta giusta      | Perfect fourth     |
| TT   | 6         | Tritono            | Tritone            |
| 5    | 7         | Quinta giusta      | Perfect fifth      |
| 6m   | 8         | Sesta minore       | Minor sixth        |
| 6M   | 9         | Sesta maggiore     | Major sixth        |
| 7m   | 10        | Settima minore     | Minor seventh      |
| 7M   | 11        | Settima maggiore   | Major seventh      |
| 8    | 12        | Ottava             | Octave             |

Directions for intervals: `ascending`, `descending`, `harmonic`.

### Scales (`abbr` → pattern, family, human name)

| abbr   | family       | IT name                   | EN name                     |
|--------|--------------|---------------------------|-----------------------------|
| Mag    | Modo         | Maggiore (Ionica)         | Major (Ionian)              |
| min    | Modo         | Minore naturale (Eolia)   | Natural minor (Aeolian)     |
| m.arm  | Minore       | Minore armonica           | Harmonic minor              |
| m.mel  | Minore       | Minore melodica           | Melodic minor               |
| Dor    | Modo         | Dorica                    | Dorian                      |
| Fri    | Modo         | Frigia                    | Phrygian                    |
| Lid    | Modo         | Lidia                     | Lydian                      |
| Mix    | Modo         | Missolidia                | Mixolydian                  |
| Loc    | Modo         | Locria                    | Locrian                     |
| Pent   | Pentatonica  | Pentatonica maggiore      | Major pentatonic            |
| PentM  | Pentatonica  | Pentatonica minore        | Minor pentatonic            |
| Blues  | Blues        | Blues                     | Blues                       |

Scales have no direction in the maestro prompt (the app plays them
ascending or descending but the explanation is the same).

### Chords (`abbr` → intervals, family, human name)

| abbr  | family    | IT name                    | EN name                    |
|-------|-----------|----------------------------|----------------------------|
| M     | Triade    | Maggiore                   | Major                      |
| m     | Triade    | Minore                     | Minor                      |
| dim   | Triade    | Diminuito                  | Diminished                 |
| aug   | Triade    | Aumentato                  | Augmented                  |
| Maj7  | Quadriade | Maggiore settima           | Major seventh              |
| m7    | Quadriade | Minore settima             | Minor seventh              |
| 7     | Quadriade | Settima di dominante       | Dominant seventh           |
| m7b5  | Quadriade | Semidiminuito (m7b5)       | Half-diminished (m7b5)     |
| dim7  | Quadriade | Diminuito settima          | Diminished seventh         |
| mMaj7 | Quadriade | Minore maggiore settima    | Minor major seventh        |

## Famous-song anchors (optional, already used by the live maestro)

You **may** reuse any of these, but must not invent new obscure ones.

Interval anchors (`<semitones>_<direction>`):

| key             | anchor (IT)                              |
|-----------------|------------------------------------------|
| 1_ascending     | Lo squalo di John Williams               |
| 1_descending    | Per Elisa di Beethoven                   |
| 2_ascending     | Fra Martino campanaro                    |
| 3_ascending     | Fumo sull'acqua dei Deep Purple          |
| 3_descending    | Hey Jude dei Beatles                     |
| 4_ascending     | Oh When the Saints                       |
| 5_ascending     | Marcia nuziale di Wagner                 |
| 7_ascending     | Guerre Stellari di John Williams         |
| 10_ascending    | Somewhere da West Side Story             |
| 12_ascending    | Over the Rainbow dal Mago di Oz          |

Scale anchors:

| abbr   | anchors                                         |
|--------|-------------------------------------------------|
| Mag    | Happy Birthday, Inno alla Gioia di Beethoven    |
| min    | Bella Ciao, Nothing Else Matters dei Metallica  |
| m.arm  | Hava Nagila, Misirlou di Dick Dale              |
| m.mel  | Stella By Starlight                             |
| Dor    | Scarborough Fair, So What di Miles Davis        |
| Fri    | White Rabbit dei Jefferson Airplane             |
| Lid    | Theme di The Simpsons, Dreams dei Fleetwood Mac |
| Mix    | Norwegian Wood dei Beatles, Sweet Home Alabama  |
| Loc    | YYZ dei Rush, Dust To Dust                      |
| Pent   | Amazing Grace, My Girl dei Temptations          |
| PentM  | Stairway to Heaven riff dei Led Zeppelin        |
| Blues  | The Thrill Is Gone di B.B. King                 |

Translate the anchor prose into English when generating the EN pool,
but keep the song title in its original language (Bella Ciao stays
"Bella Ciao" in both locales).

## Prompt to give the LLM

Paste everything below (between the markers) into the LLM as a single
user message. Run it twice: once with `TARGET_LOCALE = it`, once with
`TARGET_LOCALE = en`.

---
BEGIN PROMPT
---

You are generating a pool of pre-cached lines for a music-ear-training
PWA called Carmusician. Each line is a "maestro" tip — a warm,
telegraphic teacher speaking to a driver listening in the car.

TARGET_LOCALE: <it | en>

Rules (exact match to the live runtime):

1. Tone: warm, telegraphic, one or two sentences. Never lists, never
   markdown, never emoji, never quoted song titles.
2. Focus on **color and feel**. Never count semitones. Never name scale
   degrees by number.
3. Never tease the user.
4. Song references only if extremely globally famous (see the anchor
   table provided); otherwise omit.
5. Length: max 20 words by default. Up to 40 words allowed **only** on
   lines that reference a famous song; never longer.
6. Each line in a given pool must have a distinct opening and a
   distinct angle (one-word color, metaphor, physical movement,
   memory/song hook, emotional texture…). No near-paraphrases.
7. Output language: TARGET_LOCALE, no translations or bilingual lines.
8. Do not restate the item's name in every line.

Generate 8 lines per bucket for:

- each interval (all three directions: ascending, descending, harmonic)
- each scale (no direction)
- each chord (no direction)

Use the `abbr` as the JSON key. Use the names from the table matching
TARGET_LOCALE only as context — the output must not include them.

Return exactly one JSON document matching the schema:

```json
{
  "locale": "<TARGET_LOCALE>",
  "intervals": { "<abbr>": { "ascending": [...8 strings...],
                             "descending": [...8 strings...],
                             "harmonic":   [...8 strings...] } },
  "scales":    { "<abbr>": [...8 strings...] },
  "chords":    { "<abbr>": [...8 strings...] }
}
```

No prose before or after the JSON. Validate mentally that every array
has exactly 8 entries and no string exceeds 40 words (20 unless it
cites a famous song).

[PASTE HERE the "Intervals", "Scales", "Chords" and "Famous-song
anchors" tables from the Dataset section above — verbatim.]

---
END PROMPT
---

## Ingestion

The output files live at:

- `src/data/maestro-pool.it.json`
- `src/data/maestro-pool.en.json`

Wire-up (not yet implemented — see roadmap):

1. Add a fallback in `src/feedback/ai-feedback.ts`: if `/api/maestro`
   fails or the client is offline, pick a random line from the pool
   matching the current locale, kind, and item.
2. Optionally pre-seed the first reply from the pool while the network
   call is in flight (return pool line instantly, replace with the
   network one if it arrives before the user advances).
