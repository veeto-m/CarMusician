import * as Tone from 'tone';
import { dlog } from '@/ui/debug';
import { state } from '@/utils/state';

type ToneSynth = Tone.PolySynth<Tone.Synth> | Tone.Sampler;

let synth: Tone.PolySynth<Tone.Synth> | null = null;
let pianoSampler: Tone.Sampler | null = null;
let toneReady = false;
let pianoReady = false;

export function isToneReady(): boolean {
  return toneReady;
}

export function isPianoReady(): boolean {
  return pianoReady;
}

// Release corto (0.25s) → niente coda sonora che si sovrappone al suono
// successivo o al maestro che parla. Era 0.8s → note udibili quasi un secondo
// oltre la durata dichiarata, causando overlap e distorsione sulla voce.
function createSynth(): Tone.PolySynth<Tone.Synth> {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle8' },
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.25 },
    volume: -6,
  }).toDestination();
}

function createPianoSampler(): Tone.Sampler {
  pianoReady = false;
  const sampler = new Tone.Sampler({
    urls: {
      C3: 'C3.mp3',
      'D#3': 'Ds3.mp3',
      'F#3': 'Fs3.mp3',
      A3: 'A3.mp3',
      C4: 'C4.mp3',
      'D#4': 'Ds4.mp3',
      'F#4': 'Fs4.mp3',
      A4: 'A4.mp3',
      C5: 'C5.mp3',
      'D#5': 'Ds5.mp3',
      'F#5': 'Fs5.mp3',
      A5: 'A5.mp3',
      C6: 'C6.mp3',
    },
    baseUrl: 'https://tonejs.github.io/audio/salamander/',
    release: 0.8,
    volume: -3,
    onload: () => {
      pianoReady = true;
      dlog('Piano sampler loaded');
      const pl = document.getElementById('piano-loading');
      if (pl) pl.style.display = 'none';
    },
    onerror: (e: Error) => {
      dlog('Piano sampler error: ' + (e?.message || e));
      pianoReady = false;
    },
  }).toDestination();
  return sampler;
}

export function getActiveSynth(): ToneSynth {
  if (state.soundMode === 'piano' && pianoReady && pianoSampler) return pianoSampler;
  if (!synth) synth = createSynth();
  return synth;
}

export async function initTone(): Promise<void> {
  if (!toneReady) {
    await Tone.start();
    toneReady = true;
    dlog('Tone started');
  }
  if (!synth) synth = createSynth();
  if (!pianoSampler && state.soundMode === 'piano') pianoSampler = createPianoSampler();
}

export function ensurePianoSampler(): void {
  if (!pianoSampler && toneReady) pianoSampler = createPianoSampler();
}

// Reset duro: elimina il synth (e le note da lui già schedulate) e ne crea
// uno nuovo. Serve perché Tone.js una volta fatto triggerAttackRelease(time)
// con time futuro schedula l'evento nell'AudioContext: releaseAll NON lo
// cancella. Il piano sampler NON va distrutto: i campioni impiegano secondi
// a ricaricare e le sue note schedulate sono brevi (4n/8n) → si esauriscono
// da sole.
export function resetSynthHard(): void {
  try {
    if (synth) {
      synth.releaseAll();
      synth.disconnect();
      synth.dispose();
    }
  } catch (e) {
    dlog('synth dispose err: ' + (e as Error).message);
  }
  synth = null;
  try {
    if (pianoSampler) pianoSampler.releaseAll();
  } catch (e) {
    dlog('piano releaseAll err: ' + (e as Error).message);
  }
  if (toneReady) synth = createSynth();
}
