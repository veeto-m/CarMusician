import type { SoundMode } from '@/types';
import type { Locale } from '@/i18n/types';
import { ensurePianoSampler, isPianoReady, isToneReady } from '@/audio/synth';
import { getSelectedVoice } from '@/voice/synthesis';
import { state } from '@/utils/state';
import { $ } from '@/utils/dom';
import { saveSettings } from '@/stats/settings';
import { applyTheme } from '@/ui/theme';
import { dict, getLocale, switchLocaleAndReload } from '@/i18n';

export function setSoundMode(mode: SoundMode): void {
  state.soundMode = mode;
  saveSettings();
  updateSettingsUI();
  if (mode === 'piano' && !isPianoReady() && isToneReady()) {
    ensurePianoSampler();
  }
}

export function toggleNaturalTTS(): void {
  state.useNaturalTTS = !state.useNaturalTTS;
  saveSettings();
  updateSettingsUI();
}

export function setLanguage(loc: Locale): void {
  if (loc === getLocale()) return;
  switchLocaleAndReload(loc);
}

export function updateSettingsUI(): void {
  const pb = $('snd-piano');
  const sb = $('snd-synth');
  if (pb) pb.className = 'diff-btn' + (state.soundMode === 'piano' ? ' active' : '');
  if (sb) sb.className = 'diff-btn' + (state.soundMode === 'synth' ? ' active' : '');
  const pl = $('piano-loading');
  if (pl) pl.style.display = state.soundMode === 'piano' && !isPianoReady() ? 'block' : 'none';
  const tt = $('tts-toggle');
  if (tt) tt.className = 'toggle-sw ' + (state.useNaturalTTS ? 'on' : 'off');
  const vi = $('voice-info');
  if (vi) {
    const vInfo = dict().settings.voiceInfo;
    vi.textContent = state.useNaturalTTS
      ? vInfo.google
      : getSelectedVoice()
      ? vInfo.device(getSelectedVoice()!.name)
      : vInfo.none;
  }
  const cur = getLocale();
  (['en', 'it'] as Locale[]).forEach((loc) => {
    const b = $('lang-' + loc);
    if (b) b.className = 'diff-btn' + (cur === loc ? ' active' : '');
  });
  applyTheme();
}
