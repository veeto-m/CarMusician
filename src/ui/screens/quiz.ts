import type { Chord, Direction, Interval, QuizItem, QuizMode, Scale } from '@/types';
import {
  playChord,
  playInterval,
  playScale,
  playScalePhrase,
} from '@/audio/player';
import { stopAllAudio } from '@/audio/control';
import { initTone } from '@/audio/synth';
import { startKeepAlive } from '@/audio/keep-alive';
import { acquireWakeLock } from '@/audio/wake-lock';
import {
  setPlayEndTimer,
  getPlayEndTimer,
  stopSpeaking,
} from '@/voice/synthesis';
import { randomInt } from '@/data/notes';
import { bumpVoiceMute, state } from '@/utils/state';
import { $, $$, escapeHtml } from '@/utils/dom';
import { dlog } from '@/ui/debug';
import { showScreen } from '@/app';
import { renderDifficultyButtons } from '@/ui/components/difficulty-selector';
import { updateNextBtnText, updatePlayBtn } from '@/ui/components/play-btn';
import { updateStatsBar } from '@/ui/components/stats-bar';
import { getChords, getIntervals, getScales } from '@/ui/components/question-pools';
import { recordAnswer } from '@/stats/persistent';
import { showCorrectFeedback, showWrongFeedback } from '@/feedback/quiz-feedback';
import { dict } from '@/i18n';

export function openQuiz(mode: QuizMode): void {
  state.quizMode = mode;
  if (state.difficulty === 'custom' && mode !== 'scales') state.difficulty = 'hard';
  const title = $('quiz-title');
  if (title) {
    const t = dict().quiz.title;
    title.textContent =
      mode === 'intervals' ? t.intervals : mode === 'chords' ? t.chords : t.scales;
  }
  state.stats = { correct: 0, total: 0, streak: 0, best: 0 };
  state.history = [];
  state.answered = false;
  state.showHist = false;
  const hp = $('history-panel');
  if (hp) hp.style.display = 'none';
  const q = dict().quiz;
  if (!state.voiceEnabled) {
    const mb = $('mic-btn');
    if (mb) mb.className = 'mic-btn';
    const ml = $('mic-label');
    if (ml) ml.textContent = q.micTap;
    const vab = $('voice-advance-row');
    if (vab) vab.style.display = 'none';
  } else {
    const mb = $('mic-btn');
    if (mb) mb.className = 'mic-btn on';
    const ml = $('mic-label');
    if (ml) ml.textContent = q.micActive;
    const vab = $('voice-advance-row');
    if (vab) vab.style.display = 'flex';
  }
  renderDifficultyButtons('quiz-diff', () => {
    state.currentQ = null;
    nextQuestion();
  });
  showScreen('quiz');
  updateStatsBar();
  acquireWakeLock();
  startKeepAlive();
  initTone().then(() => genQuestion());
}

function genQuestion(): void {
  state.answered = false;
  state.isCorrectAns = null;
  state.currentQ = null;
  const fb = $('quiz-feedback');
  if (fb) fb.innerHTML = '';
  const next = $('quiz-next');
  if (next) next.style.display = 'none';

  const dirEl = $('quiz-direction');

  if (state.quizMode === 'intervals') {
    const opts = getIntervals();
    const ans = opts[randomInt(0, opts.length - 1)]!;
    const dirs: Direction[] = ['ascending', 'descending', 'harmonic'];
    const dir = dirs[randomInt(0, 2)]!;
    state.currentQ = {
      type: 'interval',
      answer: ans,
      options: [...opts],
      direction: dir,
      base: randomInt(48, 72),
    };
    if (dirEl) {
      const dl = dict().quiz.direction.interval;
      dirEl.textContent =
        dir === 'ascending' ? dl.ascending : dir === 'descending' ? dl.descending : dl.harmonic;
    }
  } else if (state.quizMode === 'chords') {
    const opts = getChords();
    const ans = opts[randomInt(0, opts.length - 1)]!;
    const dir: Direction = randomInt(0, 1) ? 'ascending' : 'descending';
    state.currentQ = {
      type: 'chord',
      answer: ans,
      options: [...opts],
      direction: dir,
      base: randomInt(48, 64),
    };
    if (dirEl) {
      const dl = dict().quiz.direction;
      dirEl.textContent = dir === 'ascending' ? dl.chordAsc : dl.chordDesc;
    }
  } else {
    const opts = getScales();
    const ans = opts[randomInt(0, opts.length - 1)]!;
    const dir: Direction = randomInt(0, 1) ? 'ascending' : 'descending';
    state.currentQ = {
      type: 'scale',
      answer: ans,
      options: [...opts],
      direction: dir,
      base: randomInt(48, 67),
    };
    if (dirEl) {
      const dl = dict().quiz.direction;
      dirEl.textContent = dir === 'ascending' ? dl.scaleAsc : dl.scaleDesc;
    }
  }

  renderOptions();
  playCurrentQ();
}

function playCurrentQ(): void {
  if (!state.currentQ) return;
  state.isPlaying = true;
  updatePlayBtn();
  let dur: number;
  const q = state.currentQ;
  if (q.type === 'interval') {
    dur = playInterval((q.answer as Interval).semitones, q.direction, q.base);
  } else if (q.type === 'chord') {
    dur = playChord((q.answer as Chord).intervals, q.direction, q.base);
  } else {
    // Hard: 1/3 fraseggio melodico; altrimenti ascendente/discendente.
    // Easy/Medium/Custom: sempre direzionale (mai fraseggi).
    if (state.difficulty === 'hard' && randomInt(0, 2) === 0) {
      dur = playScalePhrase((q.answer as Scale).pattern, q.base);
    } else {
      const pat =
        q.direction === 'descending'
          ? [...(q.answer as Scale).pattern].reverse()
          : (q.answer as Scale).pattern;
      dur = playScale(pat, q.base);
    }
  }
  const existing = getPlayEndTimer();
  if (existing) clearTimeout(existing);
  setPlayEndTimer(
    setTimeout(() => {
      setPlayEndTimer(null);
      state.isPlaying = false;
      bumpVoiceMute();
      updatePlayBtn();
    }, dur)
  );
}

export function replayQuiz(): void {
  stopAllAudio();
  if (state.currentQ) playCurrentQ();
}

export function nextQuestion(): void {
  stopAllAudio();
  if (state.pendingNext) {
    clearTimeout(state.pendingNext);
    state.pendingNext = null;
  }
  genQuestion();
}

function renderOptions(): void {
  const c = $('quiz-options');
  if (!c || !state.currentQ) return;
  c.innerHTML = '';
  const opts = state.currentQ.options;
  c.style.gridTemplateColumns = opts.length > 6 ? '1fr 1fr 1fr' : '1fr 1fr';
  opts.forEach((opt, i) => {
    const b = document.createElement('button');
    b.className = 'opt-btn';
    b.dataset.idx = String(i);
    b.innerHTML = `<span class="abbr">${escapeHtml(opt.abbr)}</span><span class="name">${escapeHtml(opt.name)}</span>`;
    b.onclick = (): void => doAnswer(opt);
    c.appendChild(b);
  });
}

export function doAnswer(opt: QuizItem): void {
  if (state.answered) return;
  if (state.isPlaying) {
    dlog('doAnswer ignored: quiz still playing');
    return;
  }
  if (!state.currentQ) return;
  state.answered = true;
  const correct = opt.name === state.currentQ.answer.name;
  state.isCorrectAns = correct;
  state.stats.total++;
  if (correct) {
    state.stats.correct++;
    state.stats.streak++;
  } else {
    state.stats.streak = 0;
  }
  state.stats.best = Math.max(state.stats.best, state.stats.streak);
  state.history.unshift({
    answer: state.currentQ.answer.name,
    selected: opt.name,
    correct,
  });
  if (state.history.length > 50) state.history.pop();
  recordAnswer(state.quizMode, state.currentQ.answer.name, correct);
  updateStatsBar();

  $$<HTMLButtonElement>('.opt-btn').forEach((b) => {
    const idx = parseInt(b.dataset.idx ?? '-1', 10);
    const o = state.currentQ!.options[idx];
    if (!o) return;
    const isAns = o.name === state.currentQ!.answer.name;
    const isSel = o.name === opt.name;
    if (isAns) b.classList.add('correct');
    else if (isSel && !correct) b.classList.add('wrong');
    b.style.pointerEvents = 'none';
  });

  if (correct) showCorrectFeedback();
  else showWrongFeedback(opt, state.currentQ.answer, state.currentQ.type, state.currentQ.direction);

  const nxt = $('quiz-next');
  if (nxt) nxt.style.display = 'block';
  updateNextBtnText();
  renderHistory();
}

export function toggleHistory(): void {
  state.showHist = !state.showHist;
  const hp = $('history-panel');
  if (hp) hp.style.display = state.showHist ? 'block' : 'none';
  if (state.showHist) renderHistory();
}

function renderHistory(): void {
  const c = $('history-panel');
  if (!c) return;
  if (!state.history.length) {
    c.innerHTML =
      `<div style="color:var(--textMuted);font-size:11px;text-align:center;">${dict().quiz.historyEmpty}</div>`;
    return;
  }
  c.innerHTML = state.history
    .map(
      (h) =>
        `<div class="history-row"><span style="color:${
          h.correct ? 'var(--correct)' : 'var(--wrong)'
        };">${h.correct ? '✓' : '✗'} ${escapeHtml(h.answer)}</span>${
          h.correct ? '' : `<span style="color:var(--textMuted);">→ ${escapeHtml(h.selected)}</span>`
        }</div>`
    )
    .join('');
}

// Programma il prossimo quiz: aspetta che il maestro abbia finito di parlare
// e che il synth abbia finito di suonare.
export function scheduleAutoNext(): void {
  if (state.pendingNext) clearTimeout(state.pendingNext);
  const tick = (): void => {
    if (state.isSpeaking || state.isPlaying) {
      state.pendingNext = setTimeout(tick, 400);
      return;
    }
    state.pendingNext = null;
    nextQuestion();
  };
  state.pendingNext = setTimeout(tick, 1500);
}

// voice-triggered replay used by matchVoice
export function voiceReplay(): void {
  stopSpeaking();
  replayQuiz();
}

// voice-triggered next used by matchVoice
export function voiceNext(): void {
  stopSpeaking();
  if (state.answered) {
    if (state.pendingNext) clearTimeout(state.pendingNext);
    nextQuestion();
  }
}
