import type { Difficulty } from '@/types';
import { SCALES } from '@/data/scales';
import { state } from '@/utils/state';
import { $ } from '@/utils/dom';
import { saveSettings } from '@/stats/settings';
import { dict } from '@/i18n';

type DifficultyChangeCallback = () => void;

export function applyDifficulty(d: Difficulty, id: string, cb?: DifficultyChangeCallback): void {
  state.difficulty = d;
  saveSettings();
  renderDifficultyButtons(id, cb);
  renderCustomScalesPanel();
  cb?.();
}

export function renderDifficultyButtons(id: string, cb?: DifficultyChangeCallback): void {
  const c = $(id);
  if (!c) return;
  c.innerHTML = '';
  const levels: Difficulty[] =
    state.quizMode === 'scales'
      ? ['easy', 'medium', 'hard', 'custom']
      : ['easy', 'medium', 'hard'];
  const diffLabels = dict().quiz.difficulty;
  levels.forEach((d) => {
    const b = document.createElement('button');
    b.className = 'diff-btn' + (state.difficulty === d ? ' active' : '');
    b.textContent = diffLabels[d];
    b.onclick = (): void => applyDifficulty(d, id, cb);
    c.appendChild(b);
  });
  renderCustomScalesPanel();
}

export function renderCustomScalesPanel(): void {
  const panel = $('custom-scales-panel');
  if (!panel) return;
  if (state.difficulty !== 'custom' || state.quizMode !== 'scales') {
    panel.style.display = 'none';
    return;
  }
  panel.style.display = 'flex';
  panel.innerHTML = '';
  SCALES.forEach((sc) => {
    const sel = state.customScales.has(sc.abbr);
    const chip = document.createElement('button');
    chip.className = 'scale-chip' + (sel ? ' selected' : '');
    chip.textContent = sc.abbr;
    chip.title = sc.name;
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      toggleCustomScale(sc.abbr, chip);
    });
    panel.appendChild(chip);
  });
  const hint = document.createElement('div');
  hint.style.cssText =
    'width:100%;font-size:9px;color:var(--textMuted);text-align:center;margin-top:4px;';
  hint.textContent = dict().quiz.difficulty.customHint;
  panel.appendChild(hint);
}

function toggleCustomScale(abbr: string, chip: HTMLButtonElement): void {
  if (state.customScales.has(abbr)) {
    if (state.customScales.size > 1) state.customScales.delete(abbr);
  } else {
    state.customScales.add(abbr);
  }
  saveSettings();
  chip.className = 'scale-chip' + (state.customScales.has(abbr) ? ' selected' : '');
}
