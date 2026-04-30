import type { QuizMode } from '@/types';
import { INTERVALS } from '@/data/intervals';
import { SCALES } from '@/data/scales';
import { CHORDS } from '@/data/chords';
import { dlog } from '@/ui/debug';
import { pStats, resetPersistentStats } from '@/stats/persistent';
import { $, escapeHtml } from '@/utils/dom';
import { showScreen } from '@/app';
import { updateHomeStatsSummary } from './home';
import { dict } from '@/i18n';

export function openStatsScreen(): void {
  const totalPct = pStats.totalAnswered
    ? Math.round((pStats.totalCorrect / pStats.totalAnswered) * 100)
    : 0;
  const t = $('st-total');
  if (t) t.textContent = String(pStats.totalAnswered);
  const p = $('st-pct');
  if (p) {
    p.textContent = totalPct + '%';
    p.style.color =
      totalPct >= 80 ? 'var(--correct)' : totalPct >= 50 ? 'var(--gold)' : 'var(--wrong)';
  }
  const d = $('st-days');
  if (d) d.textContent = String(pStats.activeDays.length);
  const s = $('st-streak');
  if (s) s.textContent = String(pStats.bestStreak);
  renderDailyChart();
  statsTab('intervals');
  showScreen('stats');
}

export function statsTab(mode: QuizMode): void {
  (['intervals', 'scales', 'chords'] as QuizMode[]).forEach((m) => {
    const btn = $('stab-' + m);
    if (btn) btn.className = 'st-tab-btn' + (m === mode ? ' active' : '');
  });
  renderStatsItems(mode);
}

function renderDailyChart(): void {
  const days = 14;
  const today = new Date();
  const bars: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const rec = pStats.daily[key];
    const t = rec ? rec.t : 0;
    const c = rec ? rec.c : 0;
    const pct = t ? Math.round((c / t) * 100) : 0;
    const height = t ? Math.max(4, Math.round(pct * 0.5)) : 0;
    const dayLabel = d.toLocaleDateString(dict().meta.dateLocale, { weekday: 'narrow' });
    const barColor =
      pct >= 80
        ? 'var(--correct)'
        : pct >= 50
        ? 'var(--gold)'
        : t > 0
        ? 'var(--wrong)'
        : 'var(--border)';
    const tooltip = t ? `${key}: ${c}/${t} (${pct}%)` : key;
    bars.push(
      `<div class="st-chart-col" title="${escapeHtml(tooltip)}"><div class="st-chart-bar-wrap"><div class="st-chart-bar" style="height:${height}px;background:${barColor};"></div></div><div class="st-chart-label">${escapeHtml(dayLabel)}</div></div>`
    );
  }
  const chart = $('stats-chart');
  if (chart) chart.innerHTML = bars.join('');
}

function renderStatsItems(mode: QuizMode): void {
  const modeKey: 'intervals' | 'scales' | 'chords' =
    mode === 'intervals' ? 'intervals' : mode === 'scales' ? 'scales' : 'chords';
  const bucket = pStats.items[modeKey];
  const dataArr = mode === 'intervals' ? INTERVALS : mode === 'scales' ? SCALES : CHORDS;
  let rows = dataArr.map((item) => {
    const rec = bucket[item.name];
    const t = rec ? rec.t : 0;
    const c = rec ? rec.c : 0;
    const pct = t ? Math.round((c / t) * 100) : -1;
    return { name: item.name, abbr: item.abbr, c, t, pct };
  });
  rows.sort((a, b) => {
    if (a.pct === -1 && b.pct === -1) return 0;
    if (a.pct === -1) return 1;
    if (b.pct === -1) return -1;
    return a.pct - b.pct;
  });
  const container = $('stats-items');
  if (!container) return;
  container.innerHTML = rows
    .map((row) => {
      if (row.pct === -1) {
        return `<div class="st-item"><div class="st-item-head"><span class="st-item-abbr">${escapeHtml(
          row.abbr
        )}</span><span class="st-item-name">${escapeHtml(
          row.name
        )}</span><span class="st-item-score" style="color:var(--textMuted);">—</span></div><div class="st-bar-bg"><div class="st-bar-fill" style="width:0%;background:var(--border);"></div></div></div>`;
      }
      const barColor =
        row.pct >= 80 ? 'var(--correct)' : row.pct >= 50 ? 'var(--gold)' : 'var(--wrong)';
      return `<div class="st-item"><div class="st-item-head"><span class="st-item-abbr">${escapeHtml(
        row.abbr
      )}</span><span class="st-item-name">${escapeHtml(
        row.name
      )}</span><span class="st-item-score" style="color:${barColor};">${row.c}/${row.t}</span></div><div class="st-bar-bg"><div class="st-bar-fill" style="width:${row.pct}%;background:${barColor};"></div></div></div>`;
    })
    .join('');
}

export function confirmResetStats(): void {
  if (!confirm(dict().stats.resetConfirm)) return;
  resetPersistentStats();
  updateHomeStatsSummary();
  openStatsScreen();
  dlog('pStats reset');
}
