import { CHORDS } from '@/data/chords';
import { INTERVALS } from '@/data/intervals';
import { SCALES } from '@/data/scales';
import type { Chord, Interval, Scale } from '@/types';
import { state } from '@/utils/state';

export function getIntervals(): readonly Interval[] {
  if (state.difficulty === 'easy') return INTERVALS.filter((i) => [3, 4, 5, 7, 12].includes(i.semitones));
  if (state.difficulty === 'medium')
    return INTERVALS.filter((i) => [2, 3, 4, 5, 7, 8, 9, 12].includes(i.semitones));
  return INTERVALS.filter((i) => i.semitones !== 0);
}

export function getScales(): readonly Scale[] {
  if (state.difficulty === 'easy') return SCALES.filter((s) => ['Mag', 'min', 'Pent'].includes(s.abbr));
  if (state.difficulty === 'medium')
    return SCALES.filter((s) =>
      ['Mag', 'min', 'm.arm', 'Dor', 'Mix', 'Pent', 'Blues'].includes(s.abbr)
    );
  if (state.difficulty === 'custom') {
    const r = SCALES.filter((s) => state.customScales.has(s.abbr));
    return r.length ? r : SCALES.slice(0, 3);
  }
  return SCALES;
}

export function getChords(): readonly Chord[] {
  if (state.difficulty === 'easy') return CHORDS.filter((c) => c.family === 'Triade');
  if (state.difficulty === 'medium')
    return CHORDS.filter((c) => ['M', 'm', 'dim', 'Maj7', 'm7', '7'].includes(c.abbr));
  return CHORDS;
}
