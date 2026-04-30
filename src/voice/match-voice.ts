import type { Difficulty } from '@/types';
import { state } from '@/utils/state';
import { dlog } from '@/ui/debug';
import { showHeard } from './recognition';
import { stopSpeaking } from './synthesis';
import { doAnswer, nextQuestion, replayQuiz, scheduleAutoNext, openQuiz } from '@/ui/screens/quiz';
import { stopAuto } from '@/ui/screens/auto-training';
import { applyDifficulty } from '@/ui/components/difficulty-selector';
import { saveSettings } from '@/stats/settings';
import { closeApp, goHome, showScreen } from '@/app';
import { dict } from '@/i18n';

function handleDifficultyVoice(d: Difficulty): void {
  const quizActive = document.getElementById('quiz')?.classList.contains('active');
  const autoActive = document.getElementById('auto-training')?.classList.contains('active');
  // Intervals/chords don't expose 'custom'; silently ignore to avoid a confusing no-op.
  if (d === 'custom' && quizActive && state.quizMode !== 'scales') return;
  if (quizActive) {
    applyDifficulty(d, 'quiz-diff', () => {
      state.currentQ = null;
      nextQuestion();
    });
    return;
  }
  if (autoActive) {
    applyDifficulty(d, 'auto-diff', () => {
      if (state.autoRunning) stopAuto();
    });
    return;
  }
  // On home / splash: just persist the preference for the next quiz.
  state.difficulty = d;
  saveSettings();
}

// Central STT command matcher. Mirrors the original matchVoice logic:
// silencing ("zitto"), dead-zone guard, navigation shortcuts from home,
// replay/advance commands, and best-alias matching against currentQ options.
export function matchVoice(transcript: string): void {
  const t = transcript.toLowerCase().trim();
  showHeard(t);
  const vc = dict().voiceCommands;

  if (vc.silence.some((w) => t.includes(w)) && state.isSpeaking) {
    stopSpeaking();
    return;
  }

  // Dead-zone: mic sordo mentre sta suonando/parlando o subito dopo.
  if (state.isPlaying || state.isSpeaking || Date.now() < state.voiceMuteUntil) {
    dlog('mic input ignorato (audio busy/dead-zone)');
    return;
  }

  if (vc.next.some((w) => t.includes(w))) {
    stopSpeaking();
    if (state.answered) {
      if (state.pendingNext) clearTimeout(state.pendingNext);
      nextQuestion();
    }
    return;
  }
  if (vc.replay.some((w) => t.includes(w))) {
    stopSpeaking();
    replayQuiz();
    return;
  }

  if (vc.closeApp.some((w) => t.includes(w))) {
    closeApp();
    return;
  }

  if (vc.back.some((w) => t.includes(w))) {
    goHome({ keepVoice: true });
    return;
  }

  if (vc.diffEasy.some((w) => t.includes(w))) {
    handleDifficultyVoice('easy');
    return;
  }
  if (vc.diffMedium.some((w) => t.includes(w))) {
    handleDifficultyVoice('medium');
    return;
  }
  if (vc.diffHard.some((w) => t.includes(w))) {
    handleDifficultyVoice('hard');
    return;
  }
  if (vc.diffCustom.some((w) => t.includes(w))) {
    handleDifficultyVoice('custom');
    return;
  }

  // Voice navigation from home
  const homeActive = document.getElementById('home')?.classList.contains('active');
  if (homeActive) {
    if (vc.goIntervals.some((w) => t.includes(w))) {
      openQuiz('intervals');
      return;
    }
    if (vc.goChords.some((w) => t.includes(w))) {
      openQuiz('chords');
      return;
    }
    if (vc.goScales.some((w) => t.includes(w))) {
      openQuiz('scales');
      return;
    }
    if (vc.goAuto.some((w) => t.includes(w))) {
      showScreen('auto-training');
      return;
    }
  }

  if (state.answered || !state.currentQ) return;

  let bestMatch: (typeof state.currentQ.options)[number] | null = null;
  let bestLen = 0;
  for (const opt of state.currentQ.options) {
    for (const alias of opt.va ?? []) {
      if (t.includes(alias.toLowerCase()) && alias.length > bestLen) {
        bestMatch = opt;
        bestLen = alias.length;
      }
    }
  }
  if (bestMatch) {
    dlog('Voice matched: ' + bestMatch.name);
    doAnswer(bestMatch);
    if (state.autoAdvance) scheduleAutoNext();
  } else {
    dlog('No match: "' + t + '"');
  }
}
