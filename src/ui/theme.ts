import type { ThemeId } from '@/types';
import { state } from '@/utils/state';
import { $, $$ } from '@/utils/dom';
import { saveSettings } from '@/stats/settings';

export const THEME_NAMES: Readonly<Record<ThemeId, string>> = {
  espresso: 'espresso · warm amber',
  concert: 'concert · gold & oxblood',
  jazz: 'jazz club · coral on navy',
  forest: 'forest · moss & amber',
  midnight: 'midnight · blue & gold',
  vinyl: 'vinyl · cream day',
};

export function applyTheme(): void {
  document.body.className = 'theme-' + state.theme;
  $$<HTMLButtonElement>('#theme-swatch button').forEach((b) => {
    b.classList.toggle('active', b.dataset.theme === state.theme);
  });
  const nm = $('theme-name');
  if (nm) nm.textContent = THEME_NAMES[state.theme] || state.theme;
}

export function setTheme(t: ThemeId): void {
  state.theme = t;
  applyTheme();
  saveSettings();
}
