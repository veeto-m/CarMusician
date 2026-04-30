import { state } from '@/utils/state';
import { $ } from '@/utils/dom';
import { dict } from '@/i18n';

export function updatePlayBtn(): void {
  const b = $('quiz-play');
  if (!b) return;
  b.textContent = state.isPlaying ? '♪' : '▶';
  b.className = 'play-btn' + (state.isPlaying ? ' playing' : '');
  updateQuizHint();
}

export function updateQuizHint(): void {
  const h = $('quiz-hint');
  if (!h) return;
  const hint = dict().quiz.hint;
  h.textContent = state.isPlaying
    ? hint.playing
    : state.voiceEnabled
    ? hint.voice
    : hint.normal;
}

export function updateNextBtnText(): void {
  const n = $('quiz-next');
  if (!n) return;
  const next = dict().quiz.next;
  n.textContent = state.voiceEnabled ? next.voice : next.normal;
}
