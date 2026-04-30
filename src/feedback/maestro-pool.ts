import type { Direction, QuestionType, QuizItem } from '@/types';
import { getLocale } from '@/i18n';
import enPool from '@/data/maestro-pool.en.json';
import itPool from '@/data/maestro-pool.it.json';

// Pool of pre-generated maestro lines, replacing the live Anthropic call.
// See docs/maestro-explanations-prompt.md for how the JSON is generated.
// Lookup is keyed by the item's `abbr` (so it doesn't care about the
// locale-specific name) and, for intervals, by direction.

interface DirectionLines {
  ascending: string[];
  descending: string[];
  harmonic: string[];
}

interface MaestroPool {
  locale: string;
  intervals: Record<string, DirectionLines>;
  scales: Record<string, string[]>;
  chords: Record<string, string[]>;
}

const POOLS: Record<'en' | 'it', MaestroPool> = {
  en: enPool as MaestroPool,
  it: itPool as MaestroPool,
};

// Avoid repeating the same line twice in a row (best-effort; pool is
// small enough that a bigger window would risk starvation).
const recentLines: string[] = [];
const RECENT_WINDOW = 3;

function pickRandom(pool: readonly string[]): string | null {
  if (!pool.length) return null;
  const fresh = pool.filter((l) => !recentLines.includes(l));
  const bucket = fresh.length ? fresh : pool;
  const pick = bucket[Math.floor(Math.random() * bucket.length)]!;
  recentLines.unshift(pick);
  if (recentLines.length > RECENT_WINDOW) recentLines.length = RECENT_WINDOW;
  return pick;
}

function resolveBucket(
  pool: MaestroPool,
  type: QuestionType,
  abbr: string,
  direction?: Direction
): readonly string[] {
  if (type === 'interval') {
    const dir: Direction = direction ?? 'ascending';
    return pool.intervals[abbr]?.[dir] ?? [];
  }
  if (type === 'scale') return pool.scales[abbr] ?? [];
  return pool.chords[abbr] ?? [];
}

// For a wrong answer, pick a line that describes the CORRECT item — the
// user needs to internalise the sound they should have picked.
export function pickConfusedLine(
  type: QuestionType,
  correct: QuizItem,
  direction?: Direction
): string | null {
  const pool = POOLS[getLocale()] ?? POOLS.en;
  return pickRandom(resolveBucket(pool, type, correct.abbr, direction));
}

// For a streak celebration / reference explanation, pick a line that
// describes the item the user just answered.
export function pickExplainLine(
  type: QuestionType,
  item: QuizItem,
  direction?: Direction
): string | null {
  const pool = POOLS[getLocale()] ?? POOLS.en;
  return pickRandom(resolveBucket(pool, type, item.abbr, direction));
}
