import type { Screen } from '@/types';
import { $, $$ } from '@/utils/dom';
import { state } from '@/utils/state';
import { stopSpeaking } from '@/voice/synthesis';
import { forceStop as stopRecognition } from '@/voice/recognition';
import { initAutoScreen, stopAuto } from '@/ui/screens/auto-training';
import { buildReference } from '@/ui/screens/reference';
import { updateSettingsUI } from '@/ui/screens/settings';
import { updateHomeStatsSummary } from '@/ui/screens/home';

export function showScreen(id: Screen): void {
  $$<HTMLElement>('.screen').forEach((s) => s.classList.remove('active'));
  const target = $(id);
  if (target) target.classList.add('active');
  if (id === 'auto-training') initAutoScreen();
  if (id === 'reference') buildReference();
  if (id === 'settings') updateSettingsUI();
  if (id === 'home') updateHomeStatsSummary();
}

export function goHome(opts: { keepVoice?: boolean } = {}): void {
  stopSpeaking();
  stopAuto();
  if (!opts.keepVoice && state.voiceEnabled) {
    state.voiceEnabled = false;
    stopRecognition();
    const vb = $('voice-badge');
    if (vb) vb.style.display = 'none';
  }
  if (state.pendingNext) {
    clearTimeout(state.pendingNext);
    state.pendingNext = null;
  }
  showScreen('home');
  state.stats = { correct: 0, total: 0, streak: 0, best: 0 };
  state.history = [];
  state.showHist = false;
  updateHomeStatsSummary();
}

// Voice "chiudi app": full teardown — stop audio, stop mic, hide voice
// badge, reset quiz state, and show the splash screen without replaying
// the welcome audio (the circle stays tappable to restart).
export function closeApp(): void {
  stopSpeaking();
  stopAuto();
  if (state.voiceEnabled) {
    state.voiceEnabled = false;
    stopRecognition();
  }
  const vb = $('voice-badge');
  if (vb) vb.style.display = 'none';
  if (state.pendingNext) {
    clearTimeout(state.pendingNext);
    state.pendingNext = null;
  }
  state.stats = { correct: 0, total: 0, streak: 0, best: 0 };
  state.history = [];
  state.showHist = false;
  state.currentQ = null;
  showScreen('welcome');
}
