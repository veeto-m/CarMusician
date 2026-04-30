import type { ChordFamily, QuestionType, ScaleFamily, ThemeId } from '@/types';

export type Locale = 'en' | 'it';

export interface ItemDict {
  name: string;
  va: string[];
}

export interface DescribedItemDict extends ItemDict {
  desc: string;
}

export interface DirectionLabels {
  ascending: string;
  descending: string;
  harmonic: string;
}

export interface Dictionary {
  meta: {
    htmlLang: string;
    srLangCode: string;
    ttsLangCode: string;
    ttsShortCode: string;
    ttsVoiceLangRegex: string;
    ttsPreferredVoiceNamesRegex: string;
    dateLocale: string;
    appName: string;
    browserNoSR: string;
  };

  voiceBadge: {
    listening: string;
    error: string;
    dots: string;
  };

  welcome: {
    claim: string;
    tapToStartLine1: string;
    tapToStartLine2: string;
    boot: string;
  };

  home: {
    subtitle: string;
    section: {
      quiz: string;
      listening: string;
      reference: string;
      progress: string;
      settings: string;
    };
    card: {
      intervalsLabel: string;
      intervalsDesc: string;
      scalesLabel: string;
      scalesDesc: string;
      chordsLabel: string;
      chordsDesc: string;
      autoLabel: string;
      autoDesc: string;
      referenceLabel: string;
      referenceDesc: string;
      statsLabel: string;
      statsEmpty: string;
      settingsLabel: string;
      settingsDesc: string;
    };
    voicePanel: {
      title: string;
      hint: string;
    };
    statsSummary: (answered: number, pct: number, days: number) => string;
  };

  quiz: {
    title: {
      intervals: string;
      chords: string;
      scales: string;
      fallback: string;
    };
    statLabels: {
      correct: string;
      pct: string;
      streak: string;
      best: string;
    };
    difficulty: {
      easy: string;
      medium: string;
      hard: string;
      custom: string;
      customHint: string;
    };
    micTap: string;
    micActive: string;
    micDenied: string;
    autoAdvance: string;
    hint: { playing: string; voice: string; normal: string };
    next: { normal: string; voice: string };
    silenceMaestro: string;
    historyEmpty: string;
    direction: {
      interval: DirectionLabels;
      chordAsc: string;
      chordDesc: string;
      scaleAsc: string;
      scaleDesc: string;
    };
    feedback: {
      correct: string;
      wrong: string;
      was: string;
      yours: string;
      correctLabel: string;
      thinking: string;
      notAvailable: string;
      maestroLabel: string;
      correctAnnouncement: string;
    };
    wrongScript: (args: { wrongName: string; rightName: string; type: QuestionType }) => {
      a: string;
      b: string;
    };
  };

  auto: {
    title: string;
    content: { intervals: string; scales: string; chords: string; mix: string };
    speed: { label: string; slow: string; normal: string; fast: string };
    pauseLabel: string;
    explainLabel: string;
    idle: string;
    status: {
      playing: string;
      announcing: string;
      repeating: string;
      maestro: string;
      paused: string;
    };
  };

  reference: {
    title: string;
    intervalsSection: string;
    listenButton: string;
    family: Record<ScaleFamily, string>;
  };

  settings: {
    title: string;
    themeSection: string;
    palette: string;
    themeNames: Record<ThemeId, string>;
    themeSwatches: Record<ThemeId, string>;
    soundSection: string;
    instrument: string;
    piano: string;
    synth: string;
    pianoLoading: string;
    voiceSection: string;
    naturalTTS: string;
    naturalTTSDesc: string;
    voiceInfo: {
      google: string;
      device: (name: string) => string;
      none: string;
    };
    languageSection: string;
    languageNames: { en: string; it: string };
  };

  stats: {
    title: string;
    labels: { total: string; accuracy: string; days: string; best: string };
    fortnight: string;
    chartHint: string;
    tabs: { intervals: string; scales: string; chords: string };
    resetButton: string;
    resetConfirm: string;
  };

  voiceCommands: {
    silence: string[];
    next: string[];
    replay: string[];
    back: string[];
    closeApp: string[];
    diffEasy: string[];
    diffMedium: string[];
    diffHard: string[];
    diffCustom: string[];
    goIntervals: string[];
    goChords: string[];
    goScales: string[];
    goAuto: string[];
  };

  mediaSession: { title: string; artist: string; album: string };

  data: {
    intervals: Record<string, ItemDict>;
    scales: Record<string, DescribedItemDict>;
    chords: Record<string, DescribedItemDict>;
    scaleFamily: Record<ScaleFamily, string>;
    chordFamily: Record<ChordFamily, string>;
  };
}
