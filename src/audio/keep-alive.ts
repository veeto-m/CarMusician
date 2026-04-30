import * as Tone from 'tone';
import { dlog } from '@/ui/debug';
import { isToneReady } from './synth';
import { dict } from '@/i18n';

// Keep-alive WebAudio: gira sullo stesso contesto Tone.js del synth e del TTS,
// quindi NON compete con HTMLAudio (niente crackling/stuttering su Android
// Auto). Usa ctx.createBuffer → riempito con float32 0.0 puro → silenzio
// matematico (niente dithering, niente hiss anche ad alto volume).

let active = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let mediaSessionReady = false;

// Callback iniettate dai moduli che hanno bisogno di reagire a pause/next
// sulle action handler di MediaSession (auto-training, quiz). Registrate
// lazy con setMediaSessionHandlers per evitare dipendenze circolari.
interface MediaSessionCallbacks {
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}
let cb: MediaSessionCallbacks = {};

export function setMediaSessionHandlers(callbacks: MediaSessionCallbacks): void {
  cb = { ...cb, ...callbacks };
}

export function startKeepAlive(): void {
  active = true;
  setupMediaSession();
  scheduleWAKeepAlive();
  dlog('keep-alive started (WebAudio)');
}

export function stopKeepAlive(): void {
  active = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = 'paused';
    } catch {
      /* ignore */
    }
  }
  dlog('keep-alive stopped');
}

function scheduleWAKeepAlive(): void {
  if (!active) return;
  if (!isToneReady()) {
    timer = setTimeout(scheduleWAKeepAlive, 1000);
    return;
  }
  try {
    const ctx = (Tone.getContext() as unknown as { rawContext: AudioContext }).rawContext;
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
    src.onended = () => {
      if (active) timer = setTimeout(scheduleWAKeepAlive, 4000);
    };
  } catch (e) {
    dlog('wa-keepalive err: ' + ((e as Error)?.message || e));
    if (active) timer = setTimeout(scheduleWAKeepAlive, 5000);
  }
}

function setupMediaSession(): void {
  if (!('mediaSession' in navigator)) return;
  if (mediaSessionReady) {
    navigator.mediaSession.playbackState = 'playing';
    return;
  }
  try {
    const ms = dict().mediaSession;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: ms.title,
      artist: ms.artist,
      album: ms.album,
      artwork: [
        { src: './icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: './icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    });
    navigator.mediaSession.playbackState = 'playing';
    navigator.mediaSession.setActionHandler('play', () => {
      startKeepAlive();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      cb.onPause?.();
      stopKeepAlive();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      cb.onNext?.();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      cb.onPrevious?.();
    });
    mediaSessionReady = true;
  } catch (e) {
    dlog('MediaSession err: ' + (e as Error).message);
  }
}
