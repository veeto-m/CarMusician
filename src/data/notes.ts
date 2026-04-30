export const NOTES: readonly string[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

// MIDI number → scientific pitch notation (e.g. 60 → "C4").
export function midiToNote(m: number): string {
  return `${NOTES[m % 12]}${Math.floor(m / 12) - 1}`;
}

export function randomInt(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
