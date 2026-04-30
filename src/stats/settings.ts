import { dlog } from '@/ui/debug';
import type { Difficulty, SoundMode, ThemeId } from '@/types';
import { state } from '@/utils/state';
import { THEME_NAMES } from '@/ui/theme';

const STORAGE_KEY = 'eartraining_settings';
const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'custom'];

interface StoredSettings {
  soundMode?: SoundMode;
  useNaturalTTS?: boolean;
  customScales?: string[];
  theme?: ThemeId;
  difficulty?: Difficulty;
}

export function loadSettings(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const s = JSON.parse(raw) as StoredSettings;
    if (s.soundMode === 'synth' || s.soundMode === 'piano') state.soundMode = s.soundMode;
    if (typeof s.useNaturalTTS === 'boolean') state.useNaturalTTS = s.useNaturalTTS;
    if (Array.isArray(s.customScales) && s.customScales.length) {
      state.customScales = new Set(s.customScales);
    }
    if (typeof s.theme === 'string' && THEME_NAMES[s.theme as ThemeId]) {
      state.theme = s.theme as ThemeId;
    }
    if (typeof s.difficulty === 'string' && VALID_DIFFICULTIES.includes(s.difficulty as Difficulty)) {
      state.difficulty = s.difficulty as Difficulty;
    }
    dlog(
      'Settings loaded: sound=' +
        state.soundMode +
        ' tts=' +
        state.useNaturalTTS +
        ' theme=' +
        state.theme +
        ' diff=' +
        state.difficulty
    );
  } catch (e) {
    dlog('loadSettings err: ' + (e as Error).message);
  }
}

export function saveSettings(): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        soundMode: state.soundMode,
        useNaturalTTS: state.useNaturalTTS,
        customScales: [...state.customScales],
        theme: state.theme,
        difficulty: state.difficulty,
      })
    );
  } catch (e) {
    dlog('saveSettings err: ' + (e as Error).message);
  }
}
