import type {
  AutoContent,
  AutoSpeed,
  Difficulty,
  HistoryEntry,
  QuizMode,
  Question,
  SoundMode,
  Stats,
  ThemeId,
} from '@/types';

// Centralized mutable state. Kept intentionally close to the original
// prototype's module-global pattern — each UI module reads/writes the
// fields it owns. Typed, but not encapsulated behind accessors: modules
// are expected to treat their own slice as authoritative.
export interface AppState {
  // Quiz
  quizMode: QuizMode;
  difficulty: Difficulty;
  currentQ: Question | null;
  answered: boolean;
  isCorrectAns: boolean | null;
  stats: Stats;
  history: HistoryEntry[];
  showHist: boolean;
  pendingNext: ReturnType<typeof setTimeout> | null;

  // Audio playback flags
  isPlaying: boolean;
  lastBaseMidi: number;

  // Auto training
  autoRunning: boolean;
  autoContent: AutoContent;
  autoPause: number;
  autoSpeed: AutoSpeed;
  autoCount: number;
  autoTimer: ReturnType<typeof setTimeout> | null;
  autoExplain: boolean;

  // Voice (STT)
  voiceEnabled: boolean;
  autoAdvance: boolean;

  // Voice (TTS)
  isSpeaking: boolean;
  useNaturalTTS: boolean;
  voiceMuteUntil: number;

  // Audio generation counter: bumped at every transition (next, goHome,
  // stopAuto). Async callbacks capture the gen at start and bail if it's
  // changed — prevents stale audio from speaking over the next quiz.
  audioGen: number;

  // Settings
  soundMode: SoundMode;
  theme: ThemeId;
  customScales: Set<string>;
}

export const state: AppState = {
  quizMode: 'intervals',
  difficulty: 'easy',
  currentQ: null,
  answered: false,
  isCorrectAns: null,
  stats: { correct: 0, total: 0, streak: 0, best: 0 },
  history: [],
  showHist: false,
  pendingNext: null,

  isPlaying: false,
  lastBaseMidi: 60,

  autoRunning: false,
  autoContent: 'mix',
  autoPause: 4,
  autoSpeed: 'normal',
  autoCount: 0,
  autoTimer: null,
  autoExplain: true,

  voiceEnabled: false,
  autoAdvance: true,

  isSpeaking: false,
  useNaturalTTS: true,
  voiceMuteUntil: 0,

  audioGen: 0,

  soundMode: 'piano',
  theme: 'espresso',
  customScales: new Set(['Mag', 'min', 'm.arm', 'Dor', 'Mix', 'Pent', 'Blues']),
};

export function freshGen(): number {
  return ++state.audioGen;
}

export function isStaleGen(gen: number): boolean {
  return gen !== state.audioGen;
}

export function bumpVoiceMute(ms = 600): void {
  state.voiceMuteUntil = Date.now() + ms;
}
