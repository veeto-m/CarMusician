import type { Interval } from '@/types';
import { dict } from '@/i18n';

interface IntervalStructure {
  semitones: number;
  abbr: string;
}

const STRUCTURE: readonly IntervalStructure[] = [
  { semitones: 0, abbr: '1' },
  { semitones: 1, abbr: '2m' },
  { semitones: 2, abbr: '2M' },
  { semitones: 3, abbr: '3m' },
  { semitones: 4, abbr: '3M' },
  { semitones: 5, abbr: '4' },
  { semitones: 6, abbr: 'TT' },
  { semitones: 7, abbr: '5' },
  { semitones: 8, abbr: '6m' },
  { semitones: 9, abbr: '6M' },
  { semitones: 10, abbr: '7m' },
  { semitones: 11, abbr: '7M' },
  { semitones: 12, abbr: '8' },
] as const;

export const INTERVALS: readonly Interval[] = STRUCTURE.map((s) => {
  const d = dict().data.intervals[s.abbr];
  return {
    semitones: s.semitones,
    abbr: s.abbr,
    name: d?.name ?? s.abbr,
    va: d ? [...d.va] : [],
  };
});
