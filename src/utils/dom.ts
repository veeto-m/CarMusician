export function $<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function $$<T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> {
  return document.querySelectorAll<T>(selector);
}

export function setText(id: string, text: string): void {
  const el = $(id);
  if (el) el.textContent = text;
}

export function setDisplay(id: string, display: string): void {
  const el = $(id);
  if (el) el.style.display = display;
}

// Escape per attributi HTML (quando inseriamo valori dinamici in innerHTML).
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
