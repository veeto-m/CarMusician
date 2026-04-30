import { $ } from '@/utils/dom';
import { pStats } from '@/stats/persistent';
import { dict } from '@/i18n';

export function updateHomeStatsSummary(): void {
  const el = $('home-stats-summary');
  if (!el) return;
  const d = dict().home;
  if (!pStats.totalAnswered) {
    el.textContent = d.card.statsEmpty;
    return;
  }
  const pct = Math.round((pStats.totalCorrect / pStats.totalAnswered) * 100);
  el.textContent = d.statsSummary(pStats.totalAnswered, pct, pStats.activeDays.length);
}
