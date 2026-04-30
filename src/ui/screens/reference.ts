import type { ScaleFamily } from '@/types';
import { INTERVALS } from '@/data/intervals';
import { SCALES } from '@/data/scales';
import { playInterval, playScale } from '@/audio/player';
import { initTone } from '@/audio/synth';
import { speak } from '@/voice/synthesis';
import { $, escapeAttr, escapeHtml } from '@/utils/dom';
import { dict } from '@/i18n';

const FAMILIES: ScaleFamily[] = ['Modo', 'Minore', 'Pentatonica', 'Blues'];

export function buildReference(): void {
  const c = $('ref-content');
  if (!c) return;
  c.innerHTML = '';

  const ref = dict().reference;
  FAMILIES.forEach((fam) => {
    let h = `<div class="section-label">${ref.family[fam]}</div>`;
    SCALES.filter((s) => s.family === fam).forEach((sc) => {
      const pattern = JSON.stringify(sc.pattern);
      h += `<div class="ref-card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span class="ref-name" style="color:${sc.color};">${escapeHtml(sc.name)}</span><button class="ref-listen" data-kind="scale" data-pattern='${escapeAttr(pattern)}' data-name="${escapeAttr(sc.name)}" style="color:${sc.color};border-color:${sc.color}55;">${ref.listenButton}</button></div><div class="ref-desc">${escapeHtml(sc.desc)}</div><div class="ref-degrees">${sc.pattern
        .map((s) => `<span class="ref-deg" style="background:${sc.color}18;color:${sc.color};">${s}</span>`)
        .join('')}</div></div>`;
    });
    c.innerHTML += h;
  });

  let ih = `<div class="section-label" style="margin-top:16px;">${ref.intervalsSection}</div><div class="int-grid">`;
  INTERVALS.forEach((iv) => {
    ih += `<button class="int-btn" data-kind="interval" data-semitones="${iv.semitones}" data-name="${escapeAttr(iv.name)}"><span class="int-abbr">${escapeHtml(iv.abbr)}</span><span class="int-name">${escapeHtml(iv.name)}</span></button>`;
  });
  c.innerHTML += ih + '</div>';

  // Delegate clicks: avoids inline onclick handlers that don't play well
  // with TS bundling.
  c.querySelectorAll<HTMLButtonElement>('[data-kind]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.kind;
      const name = btn.dataset.name ?? '';
      if (kind === 'scale') {
        const pattern = JSON.parse(btn.dataset.pattern ?? '[]') as number[];
        void playRef('scale', pattern, name);
      } else if (kind === 'interval') {
        const semitones = parseInt(btn.dataset.semitones ?? '0', 10);
        void playRef('interval', semitones, name);
      }
    });
  });
}

async function playRef(type: 'scale' | 'interval', data: number | number[], name: string): Promise<void> {
  await initTone();
  let delay: number;
  if (type === 'scale') {
    const pattern = data as number[];
    playScale(pattern);
    delay = pattern.length * 300 + 200;
  } else {
    playInterval(data as number, 'ascending');
    delay = 1200;
  }
  setTimeout(() => speak(name), delay);
}
