import '../styles/main.css';
import '../styles/components.css';
import '../styles/screens.css';

import type { QuizMode, Screen, SoundMode, ThemeId } from '@/types';
import { state } from '@/utils/state';
import { dlog, toggleDebug } from '@/ui/debug';
import { $, $$ } from '@/utils/dom';

import { goHome, showScreen } from '@/app';
import { startApp } from '@/ui/screens/welcome';
import { loadSettings } from '@/stats/settings';
import { loadPersistentStats } from '@/stats/persistent';
import { updateHomeStatsSummary } from '@/ui/screens/home';
import { applyTheme, setTheme } from '@/ui/theme';
import { initVoiceList, stopSpeaking } from '@/voice/synthesis';
import {
  isSRSupported,
  setTranscriptHandler,
  startVoice,
  toggleAutoAdvance,
  toggleVoice,
} from '@/voice/recognition';
import { matchVoice } from '@/voice/match-voice';
import {
  nextQuestion,
  openQuiz,
  replayQuiz,
  toggleHistory,
} from '@/ui/screens/quiz';
import {
  changePause,
  initAutoScreen,
  stopAuto,
  toggleAutoExplain,
  toggleAutoTraining,
} from '@/ui/screens/auto-training';
import { setLanguage, setSoundMode, toggleNaturalTTS } from '@/ui/screens/settings';
import type { Locale } from '@/i18n/types';
import { confirmResetStats, openStatsScreen, statsTab } from '@/ui/screens/stats';
import { acquireWakeLock } from '@/audio/wake-lock';
import { startKeepAlive, setMediaSessionHandlers } from '@/audio/keep-alive';
import { hydrateDom } from '@/i18n';

const APP_VERSION = 'v2026.04.30.1';

function wireActions(): void {
  document.body.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (!action) return;
    switch (action) {
      case 'startApp':
        void startApp();
        return;
      case 'goHome':
        goHome();
        return;
      case 'showScreen': {
        const s = target.dataset.screen as Screen | undefined;
        if (s) showScreen(s);
        return;
      }
      case 'openQuiz': {
        const m = target.dataset.mode as QuizMode | undefined;
        if (m) openQuiz(m);
        return;
      }
      case 'openStatsScreen':
        openStatsScreen();
        return;
      case 'replayQuiz':
        replayQuiz();
        return;
      case 'nextQuestion':
        nextQuestion();
        return;
      case 'toggleHistory':
        toggleHistory();
        return;
      case 'toggleVoice':
        void toggleVoice();
        return;
      case 'toggleAutoAdvance':
        toggleAutoAdvance();
        return;
      case 'stopSpeaking':
        stopSpeaking();
        return;
      case 'toggleAutoTraining':
        void toggleAutoTraining();
        return;
      case 'toggleAutoExplain':
        toggleAutoExplain();
        return;
      case 'changePause': {
        const d = parseInt(target.dataset.delta ?? '0', 10);
        changePause(d);
        return;
      }
      case 'stopAutoGoHome':
        stopAuto();
        goHome();
        return;
      case 'setSoundMode': {
        const mode = target.dataset.sound as SoundMode | undefined;
        if (mode) setSoundMode(mode);
        return;
      }
      case 'toggleNaturalTTS':
        toggleNaturalTTS();
        return;
      case 'setLanguage': {
        const loc = target.dataset.locale as Locale | undefined;
        if (loc === 'en' || loc === 'it') setLanguage(loc);
        return;
      }
      case 'statsTab': {
        const tab = target.dataset.tab as QuizMode | undefined;
        if (tab) statsTab(tab);
        return;
      }
      case 'confirmResetStats':
        confirmResetStats();
        return;
      case 'toggleDebug':
        toggleDebug();
        return;
    }
  });

  // Theme swatch buttons carry data-theme, not data-action.
  $$<HTMLButtonElement>('#theme-swatch button').forEach((b) => {
    b.addEventListener('click', () => {
      const t = b.dataset.theme as ThemeId | undefined;
      if (t) setTheme(t);
    });
  });
}

function wireVisibilityChange(): void {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible') return;
    if (state.autoRunning || state.voiceEnabled || state.currentQ) {
      await acquireWakeLock();
      startKeepAlive();
      if (state.voiceEnabled) startVoice();
    }
  });
}

function wireMediaSession(): void {
  setMediaSessionHandlers({
    onPause: () => {
      if (state.autoRunning) stopAuto();
      stopSpeaking();
    },
    onNext: () => {
      if (state.answered) nextQuestion();
    },
    onPrevious: () => {
      replayQuiz();
    },
  });
}

function showVersion(): void {
  const wv = $('welcome-version');
  if (wv) wv.textContent = APP_VERSION;
  const hv = $('home-version');
  if (hv) hv.textContent = APP_VERSION;
}

function bootstrap(): void {
  loadSettings();
  loadPersistentStats();
  hydrateDom();
  applyTheme();
  initVoiceList();
  setTranscriptHandler(matchVoice);
  wireActions();
  wireVisibilityChange();
  wireMediaSession();
  updateHomeStatsSummary();
  initAutoScreen();
  showVersion();
  dlog('App loaded ' + APP_VERSION + '. SR:' + isSRSupported());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
