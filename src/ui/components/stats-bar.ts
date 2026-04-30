import { state } from '@/utils/state';
import { $ } from '@/utils/dom';

export function updateStatsBar(): void {
  const pct = state.stats.total ? Math.round((state.stats.correct / state.stats.total) * 100) : 0;
  const score = $('stat-score');
  if (score) score.textContent = `${state.stats.correct}/${state.stats.total}`;
  const pe = $('stat-pct');
  if (pe) {
    pe.textContent = `${pct}%`;
    pe.style.color = pct >= 80 ? 'var(--correct)' : pct >= 50 ? 'var(--gold)' : 'var(--wrong)';
  }
  const se = $('stat-streak');
  if (se) {
    se.textContent = String(state.stats.streak);
    se.style.color = state.stats.streak >= 5 ? 'var(--gold)' : 'var(--text)';
  }
  const be = $('stat-best');
  if (be) be.textContent = String(state.stats.best);
}
