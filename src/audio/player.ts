import * as Tone from 'tone';
import { SCALE_PHRASES } from '@/data/scales';
import { midiToNote, randomInt } from '@/data/notes';
import type { Chord, Direction, Interval, QuestionType, QuizItem, Scale } from '@/types';
import { state } from '@/utils/state';
import { getActiveSynth } from './synth';

// Tutti i ritorni includono un "tail buffer" di ~500ms per coprire la coda
// dell'envelope release: il prossimo audio (voce o synth) parte quando il
// precedente è COMPLETAMENTE silente.
export const TAIL_BUFFER = 500;

export function playInterval(
  semi: number,
  dir: Direction,
  baseOverride?: number
): number {
  const s = getActiveSynth();
  const base = baseOverride != null ? baseOverride : randomInt(48, 72);
  state.lastBaseMidi = base;
  const n1 = midiToNote(base);
  const n2 = midiToNote(base + semi);
  const now = Tone.now();
  if (dir === 'harmonic') {
    s.triggerAttackRelease([n1, n2], '2n', now);
    return 1200 + TAIL_BUFFER;
  }
  const first = dir === 'descending' ? n2 : n1;
  const second = dir === 'descending' ? n1 : n2;
  s.triggerAttackRelease(first, '4n', now);
  s.triggerAttackRelease(second, '4n', now + 0.55);
  return 1600 + TAIL_BUFFER;
}

export function playIntervalFromBase(
  semi: number,
  base: number,
  dir: Direction
): number {
  const s = getActiveSynth();
  const n1 = midiToNote(base);
  const n2 = midiToNote(base + semi);
  const now = Tone.now();
  if (dir === 'harmonic') {
    s.triggerAttackRelease([n1, n2], '2n', now);
    return 1200 + TAIL_BUFFER;
  }
  const first = dir === 'descending' ? n2 : n1;
  const second = dir === 'descending' ? n1 : n2;
  s.triggerAttackRelease(first, '4n', now);
  s.triggerAttackRelease(second, '4n', now + 0.55);
  return 1600 + TAIL_BUFFER;
}

function scaleStepDelay(): number {
  return state.autoSpeed === 'slow' ? 0.4 : state.autoSpeed === 'fast' ? 0.22 : 0.3;
}

export function playScale(pattern: readonly number[], baseOverride?: number): number {
  const s = getActiveSynth();
  const base = baseOverride != null ? baseOverride : randomInt(48, 67);
  const now = Tone.now();
  const sp = scaleStepDelay();
  pattern.forEach((semi, i) => s.triggerAttackRelease(midiToNote(base + semi), '8n', now + i * sp));
  return pattern.length * (sp * 1000) + TAIL_BUFFER;
}

export function playScaleFromBase(pattern: readonly number[], base: number): number {
  const s = getActiveSynth();
  const now = Tone.now();
  pattern.forEach((semi, i) => s.triggerAttackRelease(midiToNote(base + semi), '8n', now + i * 0.3));
  return pattern.length * 300 + TAIL_BUFFER;
}

export function playScalePhrase(pattern: readonly number[], base: number): number {
  const s = getActiveSynth();
  const phrase = SCALE_PHRASES[Math.floor(Math.random() * SCALE_PHRASES.length)]!;
  const now = Tone.now();
  const sp = state.autoSpeed === 'slow' ? 0.32 : state.autoSpeed === 'fast' ? 0.18 : 0.24;
  phrase.forEach((idx, i) => {
    const semi = pattern[(((idx % pattern.length) + pattern.length) % pattern.length)]!;
    s.triggerAttackRelease(midiToNote(base + semi), '8n', now + i * sp);
  });
  return phrase.length * (sp * 1000) + TAIL_BUFFER;
}

// Accordo: prima arpeggiato poi bloccato.
export function playChord(
  intervals: readonly number[],
  dir: Direction,
  baseOverride?: number
): number {
  const base = baseOverride != null ? baseOverride : randomInt(48, 64);
  state.lastBaseMidi = base;
  return playChordFromBase(intervals, base, dir);
}

export function playChordFromBase(
  intervals: readonly number[],
  base: number,
  dir: Direction
): number {
  const s = getActiveSynth();
  const notes = intervals.map((semi) => midiToNote(base + semi));
  const now = Tone.now();
  const arp = dir === 'descending' ? [...notes].reverse() : notes;
  const sp = 0.28;
  arp.forEach((n, i) => s.triggerAttackRelease(n, '8n', now + i * sp));
  const blockAt = now + arp.length * sp + 0.25;
  s.triggerAttackRelease(notes, '2n', blockAt);
  // arpeggio + blocco (2n = 1s) + tail
  return arp.length * (sp * 1000) + 250 + 1000 + TAIL_BUFFER;
}

// Riproduce un item generico da una base nota. Usato da auto-training e dai
// confronti sonici nel feedback sbagliato (stessa base per giusto e sbagliato).
export function playItemFromBase(
  type: QuestionType,
  item: QuizItem,
  base: number,
  direction: Direction
): number {
  if (type === 'interval') {
    return playIntervalFromBase((item as Interval).semitones, base, direction);
  }
  if (type === 'scale') {
    const pattern = (item as Scale).pattern;
    const pat = direction === 'descending' ? [...pattern].reverse() : pattern;
    return playScaleFromBase(pat, base);
  }
  if (type === 'chord') {
    return playChordFromBase((item as Chord).intervals, base, direction);
  }
  return 1000;
}
