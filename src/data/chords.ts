import type { Chord } from '@/types';
import { dict } from '@/i18n';

interface ChordStructure {
  abbr: string;
  intervals: number[];
  family: Chord['family'];
}

const STRUCTURE: readonly ChordStructure[] = [
  { abbr: 'M', intervals: [0, 4, 7], family: 'Triade' },
  { abbr: 'm', intervals: [0, 3, 7], family: 'Triade' },
  { abbr: 'dim', intervals: [0, 3, 6], family: 'Triade' },
  { abbr: 'aug', intervals: [0, 4, 8], family: 'Triade' },
  { abbr: 'Maj7', intervals: [0, 4, 7, 11], family: 'Quadriade' },
  { abbr: 'm7', intervals: [0, 3, 7, 10], family: 'Quadriade' },
  { abbr: '7', intervals: [0, 4, 7, 10], family: 'Quadriade' },
  { abbr: 'm7b5', intervals: [0, 3, 6, 10], family: 'Quadriade' },
  { abbr: 'dim7', intervals: [0, 3, 6, 9], family: 'Quadriade' },
  { abbr: 'mMaj7', intervals: [0, 3, 7, 11], family: 'Quadriade' },
] as const;

export const CHORDS: readonly Chord[] = STRUCTURE.map((s) => {
  const d = dict().data.chords[s.abbr];
  return {
    abbr: s.abbr,
    intervals: [...s.intervals],
    family: s.family,
    name: d?.name ?? s.abbr,
    desc: d?.desc ?? '',
    va: d ? [...d.va] : [],
  };
});
