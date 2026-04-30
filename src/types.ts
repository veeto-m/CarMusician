export interface Interval {
  semitones: number;
  name: string;
  abbr: string;
  va: string[];
}

export type ScaleFamily = 'Modo' | 'Minore' | 'Pentatonica' | 'Blues';

export interface Scale {
  name: string;
  pattern: number[];
  abbr: string;
  family: ScaleFamily;
  desc: string;
  color: string;
  va: string[];
}

export type ChordFamily = 'Triade' | 'Quadriade';

export interface Chord {
  name: string;
  intervals: number[];
  abbr: string;
  family: ChordFamily;
  desc: string;
  va: string[];
}

export type QuizItem = Interval | Scale | Chord;

export type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';
export type Direction = 'ascending' | 'descending' | 'harmonic';
export type QuestionType = 'interval' | 'scale' | 'chord';
export type QuizMode = 'intervals' | 'scales' | 'chords';
export type Screen =
  | 'welcome'
  | 'home'
  | 'quiz'
  | 'auto-training'
  | 'reference'
  | 'settings'
  | 'stats';

export type ThemeId =
  | 'espresso'
  | 'concert'
  | 'jazz'
  | 'forest'
  | 'midnight'
  | 'vinyl';

export type SoundMode = 'piano' | 'synth';
export type AutoContent = 'intervals' | 'scales' | 'chords' | 'mix';
export type AutoSpeed = 'slow' | 'normal' | 'fast';

export interface Question {
  type: QuestionType;
  answer: QuizItem;
  options: QuizItem[];
  direction: Direction;
  base: number;
}

export interface Stats {
  correct: number;
  total: number;
  streak: number;
  best: number;
}

export interface HistoryEntry {
  answer: string;
  selected: string;
  correct: boolean;
}

export interface ItemStat {
  c: number;
  t: number;
}

export interface DailyStat {
  c: number;
  t: number;
}

export interface PersistentStats {
  version: number;
  bestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  activeDays: string[];
  items: {
    intervals: Record<string, ItemStat>;
    scales: Record<string, ItemStat>;
    chords: Record<string, ItemStat>;
  };
  daily: Record<string, DailyStat>;
}

export interface UserSettings {
  soundMode: SoundMode;
  useNaturalTTS: boolean;
  customScales: string[];
  theme: ThemeId;
}
