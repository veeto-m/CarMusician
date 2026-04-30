import type { Dictionary, Locale } from './types';
import { it } from './it';
import { en } from './en';

const STORAGE_KEY = 'eartraining_locale';
const FALLBACK_LOCALE: Locale = 'en';

const DICTS: Record<Locale, Dictionary> = { en, it };

let currentLocale: Locale = readStoredLocale() ?? detectBrowserLocale() ?? FALLBACK_LOCALE;

function readStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'it') return v;
  } catch {
    /* ignore */
  }
  return null;
}

function detectBrowserLocale(): Locale | null {
  if (typeof navigator === 'undefined') return null;
  const candidates: string[] = [];
  if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
  if (navigator.language) candidates.push(navigator.language);
  for (const raw of candidates) {
    const lang = (raw || '').toLowerCase().split(/[-_]/)[0];
    if (lang === 'it') return 'it';
    if (lang === 'en') return 'en';
  }
  return null;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(loc: Locale): void {
  currentLocale = loc;
  try {
    localStorage.setItem(STORAGE_KEY, loc);
  } catch {
    /* ignore */
  }
}

// Language switch at runtime: persist + hard reload. Dynamic UI (difficulty
// buttons, auto-training buttons, stats, reference) is built imperatively at
// screen-enter time, so a reload is the simplest way to guarantee a clean
// re-render in the new locale and refresh the cached TTS voice pick.
export function switchLocaleAndReload(loc: Locale): void {
  setLocale(loc);
  try {
    location.reload();
  } catch {
    /* ignore */
  }
}

export function dict(): Dictionary {
  return DICTS[currentLocale];
}

// Apply translations to every [data-i18n=...] element in the document.
// `path` is dot-separated (e.g. "home.section.quiz"). Attribute-oriented
// variants: data-i18n-attr="title" translates the `title` attribute instead
// of textContent. data-i18n-html="1" sets innerHTML instead of textContent.
export function hydrateDom(root: ParentNode = document): void {
  const d = dict();
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const path = el.dataset.i18n;
    if (!path) return;
    const val = lookup(d, path);
    if (typeof val !== 'string') return;
    const attr = el.dataset.i18nAttr;
    if (attr) {
      el.setAttribute(attr, val);
      return;
    }
    if (el.dataset.i18nHtml === '1') {
      el.innerHTML = val;
      return;
    }
    el.textContent = val;
  });
  const htmlEl = document.documentElement;
  if (htmlEl) htmlEl.lang = d.meta.htmlLang;
}

function lookup(root: unknown, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = root;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
}
