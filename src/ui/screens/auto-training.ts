import type { AutoContent, AutoSpeed, Chord, Direction, Interval, QuestionType, Scale } from '@/types';
import { playChord, playInterval, playScale } from '@/audio/player';
import { initTone } from '@/audio/synth';
import { startKeepAlive } from '@/audio/keep-alive';
import { acquireWakeLock } from '@/audio/wake-lock';
import { speak, stopSpeaking } from '@/voice/synthesis';
import { randomInt } from '@/data/notes';
import { bumpVoiceMute, state } from '@/utils/state';
import { $ } from '@/utils/dom';
import { renderDifficultyButtons } from '@/ui/components/difficulty-selector';
import { getChords, getIntervals, getScales } from '@/ui/components/question-pools';
import { pickExplainLine } from '@/feedback/maestro-pool';
import { dict } from '@/i18n';

export function initAutoScreen(): void {
  renderDifficultyButtons('auto-diff', () => {
    if (state.autoRunning) stopAuto();
  });
  const a = dict().auto;
  const cc = $('auto-content-row');
  if (cc) {
    cc.innerHTML = '';
    (['intervals', 'scales', 'chords', 'mix'] as AutoContent[]).forEach((id) => {
      const b = document.createElement('button');
      b.className = 'content-btn' + (state.autoContent === id ? ' active' : '');
      b.textContent = a.content[id];
      b.onclick = (): void => {
        state.autoContent = id;
        if (state.autoRunning) stopAuto();
        initAutoScreen();
      };
      cc.appendChild(b);
    });
  }
  const sr = $('auto-speed-row');
  if (sr) {
    sr.innerHTML = `<span class="speed-label">${a.speed.label}</span>`;
    (['slow', 'normal', 'fast'] as AutoSpeed[]).forEach((s) => {
      const b = document.createElement('button');
      b.className = 'speed-btn' + (state.autoSpeed === s ? ' active' : '');
      b.textContent = a.speed[s];
      b.onclick = (): void => {
        state.autoSpeed = s;
        initAutoScreen();
      };
      sr.appendChild(b);
    });
  }
  const expToggle = $('auto-explain-toggle');
  if (expToggle) expToggle.className = 'toggle-sw ' + (state.autoExplain ? 'on' : 'off');

  const pv = $('pause-val');
  if (pv) pv.textContent = state.autoPause + 's';
  updateAutoUI();
}

export function toggleAutoExplain(): void {
  state.autoExplain = !state.autoExplain;
  const t = $('auto-explain-toggle');
  if (t) t.className = 'toggle-sw ' + (state.autoExplain ? 'on' : 'off');
}

export function changePause(delta: number): void {
  state.autoPause = Math.max(1, Math.min(10, state.autoPause + delta));
  const pv = $('pause-val');
  if (pv) pv.textContent = state.autoPause + 's';
}

export function updateAutoUI(): void {
  const btn = $('auto-play-btn');
  const idle = $('auto-idle-text');
  if (!btn || !idle) return;
  if (state.autoRunning) {
    btn.innerHTML = '<span class="msym">pause</span>';
    btn.className = 'play-btn play-btn-big running' + (state.isPlaying ? ' playing' : '');
    idle.style.display = 'none';
    const counter = $('auto-counter');
    if (counter) counter.textContent = '#' + state.autoCount;
  } else {
    btn.innerHTML = '<span class="msym">play_arrow</span>';
    btn.className = 'play-btn play-btn-big';
    idle.style.display = 'block';
    const an = $('auto-name');
    if (an) an.textContent = '';
    const asEl = $('auto-status');
    if (asEl) asEl.textContent = '';
    const counter = $('auto-counter');
    if (counter) counter.textContent = '';
  }
}

export async function toggleAutoTraining(): Promise<void> {
  if (state.autoRunning) {
    stopAuto();
    return;
  }
  await initTone();
  await startKeepAlive();
  await acquireWakeLock();
  state.autoRunning = true;
  state.autoCount = 0;
  updateAutoUI();
  runAutoStep();
}

export function stopAuto(): void {
  state.autoRunning = false;
  if (state.autoTimer) {
    clearTimeout(state.autoTimer);
    state.autoTimer = null;
  }
  stopSpeaking();
  state.isPlaying = false;
  updateAutoUI();
}

async function runAutoStep(): Promise<void> {
  if (!state.autoRunning) return;
  const intervals = getIntervals();
  const scales = getScales();
  const chords = getChords();
  const pickType = (): QuestionType => {
    if (state.autoContent === 'intervals') return 'interval';
    if (state.autoContent === 'scales') return 'scale';
    if (state.autoContent === 'chords') return 'chord';
    const pool: QuestionType[] = ['interval', 'scale', 'chord'];
    return pool[randomInt(0, pool.length - 1)]!;
  };
  const type = pickType();
  const item =
    type === 'interval'
      ? intervals[randomInt(0, intervals.length - 1)]!
      : type === 'scale'
      ? scales[randomInt(0, scales.length - 1)]!
      : chords[randomInt(0, chords.length - 1)]!;

  state.autoCount++;
  const an = $('auto-name');
  if (an) an.textContent = item.name;
  const counter = $('auto-counter');
  if (counter) counter.textContent = '#' + state.autoCount;
  state.isPlaying = true;
  updateAutoUI();
  const statusEl = $('auto-status');
  const st = dict().auto.status;
  if (statusEl) statusEl.textContent = st.playing;
  const dir: Direction = (['ascending', 'descending'] as Direction[])[randomInt(0, 1)]!;

  let dur: number;
  if (type === 'interval') dur = playInterval((item as Interval).semitones, dir);
  else if (type === 'chord') dur = playChord((item as Chord).intervals, dir);
  else dur = playScale((item as Scale).pattern);

  state.autoTimer = setTimeout(async () => {
    if (!state.autoRunning) return;
    state.isPlaying = false;
    bumpVoiceMute();
    updateAutoUI();
    if (statusEl) statusEl.textContent = st.announcing;
    await speak(item.name);
    if (!state.autoRunning) return;
    state.autoTimer = setTimeout(async () => {
      if (!state.autoRunning) return;
      state.isPlaying = true;
      updateAutoUI();
      if (statusEl) statusEl.textContent = st.repeating;
      let dur2: number;
      if (type === 'interval') dur2 = playInterval((item as Interval).semitones, dir);
      else if (type === 'chord') dur2 = playChord((item as Chord).intervals, dir);
      else dur2 = playScale((item as Scale).pattern);
      state.autoTimer = setTimeout(async () => {
        state.isPlaying = false;
        bumpVoiceMute();
        updateAutoUI();
        if (!state.autoRunning) return;
        if (state.autoExplain) {
          if (statusEl) statusEl.textContent = st.maestro;
          const aiText = pickExplainLine(type, item, dir);
          if (!state.autoRunning) return;
          if (aiText) {
            await speak(aiText);
            if (!state.autoRunning) return;
          }
        }
        if (statusEl) statusEl.textContent = st.paused;
        state.autoTimer = setTimeout(() => {
          if (state.autoRunning) runAutoStep();
        }, state.autoPause * 1000);
      }, dur2);
    }, 800);
  }, dur);
}
