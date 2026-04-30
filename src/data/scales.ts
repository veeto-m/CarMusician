import type { Scale } from '@/types';
import { dict } from '@/i18n';

interface ScaleStructure {
  abbr: string;
  pattern: number[];
  family: Scale['family'];
  color: string;
}

const STRUCTURE: readonly ScaleStructure[] = [
  { abbr: 'Mag', pattern: [0, 2, 4, 5, 7, 9, 11, 12], family: 'Modo', color: '#6c5ce7' },
  { abbr: 'min', pattern: [0, 2, 3, 5, 7, 8, 10, 12], family: 'Modo', color: '#a29bfe' },
  { abbr: 'm.arm', pattern: [0, 2, 3, 5, 7, 8, 11, 12], family: 'Minore', color: '#fd79a8' },
  { abbr: 'm.mel', pattern: [0, 2, 3, 5, 7, 9, 11, 12], family: 'Minore', color: '#e17055' },
  { abbr: 'Dor', pattern: [0, 2, 3, 5, 7, 9, 10, 12], family: 'Modo', color: '#00b894' },
  { abbr: 'Fri', pattern: [0, 1, 3, 5, 7, 8, 10, 12], family: 'Modo', color: '#e84393' },
  { abbr: 'Lid', pattern: [0, 2, 4, 6, 7, 9, 11, 12], family: 'Modo', color: '#ffd32a' },
  { abbr: 'Mix', pattern: [0, 2, 4, 5, 7, 9, 10, 12], family: 'Modo', color: '#0984e3' },
  { abbr: 'Loc', pattern: [0, 1, 3, 5, 6, 8, 10, 12], family: 'Modo', color: '#636e72' },
  { abbr: 'Pent', pattern: [0, 2, 4, 7, 9, 12], family: 'Pentatonica', color: '#00cec9' },
  { abbr: 'PentM', pattern: [0, 3, 5, 7, 10, 12], family: 'Pentatonica', color: '#81ecec' },
  { abbr: 'Blues', pattern: [0, 3, 5, 6, 7, 10, 12], family: 'Blues', color: '#74b9ff' },
] as const;

export const SCALES: readonly Scale[] = STRUCTURE.map((s) => {
  const d = dict().data.scales[s.abbr];
  return {
    abbr: s.abbr,
    pattern: [...s.pattern],
    family: s.family,
    color: s.color,
    name: d?.name ?? s.abbr,
    desc: d?.desc ?? '',
    va: d ? [...d.va] : [],
  };
});

// Melodic phrases built on the scale degrees. Indices are modulo
// pattern.length so they also work on pentatonics (6 notes).
export const SCALE_PHRASES: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 2, 1, 0],
  [0, 2, 4, 2, 0, 4, 2, 0],
  [0, 1, 2, 3, 4, 3, 2, 1, 0],
  [0, 2, 4, 5, 4, 2, 0],
  [0, 3, 5, 3, 0, 5, 3, 0],
  [0, 1, 3, 1, 0, 3, 1],
  [0, 4, 2, 0, 4, 2, 0],
  [0, 2, 4, 6, 4, 2, 0],
] as const;
