import { dlog } from '@/ui/debug';
import type { PersistentStats, QuizMode } from '@/types';
import { state } from '@/utils/state';

const STORAGE_KEY = 'eartraining_stats';
const DAILY_RETENTION_DAYS = 90;

export let pStats: PersistentStats = {
  version: 1,
  bestStreak: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  activeDays: [],
  items: { intervals: {}, scales: {}, chords: {} },
  daily: {},
};

export function loadPersistentStats(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as PersistentStats;
    if (!saved.version) return;
    pStats = saved;
    pStats.items = pStats.items || { intervals: {}, scales: {}, chords: {} };
    (['intervals', 'scales', 'chords'] as const).forEach((m) => {
      pStats.items[m] = pStats.items[m] || {};
    });
    pStats.daily = pStats.daily || {};
    pStats.activeDays = pStats.activeDays || [];
    dlog('pStats loaded: ' + pStats.totalAnswered + ' risposte');
  } catch (e) {
    dlog('pStats load error: ' + (e as Error).message);
  }
}

export function savePersistentStats(): void {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DAILY_RETENTION_DAYS);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    Object.keys(pStats.daily).forEach((d) => {
      if (d < cutoffStr) delete pStats.daily[d];
    });
    pStats.activeDays = pStats.activeDays.filter((d) => d >= cutoffStr).sort();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pStats));
  } catch (e) {
    dlog('pStats save error: ' + (e as Error).message);
  }
}

export function recordAnswer(mode: QuizMode, itemName: string, correct: boolean): void {
  const modeKey: 'intervals' | 'scales' | 'chords' =
    mode === 'intervals' ? 'intervals' : mode === 'scales' ? 'scales' : 'chords';
  const bucket = pStats.items[modeKey];
  if (!bucket[itemName]) bucket[itemName] = { c: 0, t: 0 };
  bucket[itemName]!.t++;
  if (correct) bucket[itemName]!.c++;
  pStats.totalAnswered++;
  if (correct) pStats.totalCorrect++;
  if (state.stats.best > pStats.bestStreak) pStats.bestStreak = state.stats.best;
  const today = new Date().toISOString().slice(0, 10);
  if (!pStats.daily[today]) pStats.daily[today] = { c: 0, t: 0 };
  pStats.daily[today]!.t++;
  if (correct) pStats.daily[today]!.c++;
  if (!pStats.activeDays.includes(today)) pStats.activeDays.push(today);
  savePersistentStats();
}

export function resetPersistentStats(): void {
  pStats = {
    version: 1,
    bestStreak: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    activeDays: [],
    items: { intervals: {}, scales: {}, chords: {} },
    daily: {},
  };
  savePersistentStats();
  dlog('pStats reset');
}
