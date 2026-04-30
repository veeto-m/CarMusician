import { $ } from '@/utils/dom';

let debugVisible = false;

export function dlog(message: string): void {
  const el = $('debug-log');
  if (el) {
    const time = new Date().toLocaleTimeString();
    el.innerHTML += `<div>[${time}] ${message}</div>`;
    el.scrollTop = el.scrollHeight;
  }
  console.log('[ET]', message);
}

export function toggleDebug(): void {
  debugVisible = !debugVisible;
  const el = $('debug-log');
  if (el) el.style.display = debugVisible ? 'block' : 'none';
}
