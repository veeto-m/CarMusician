import { dlog } from '@/ui/debug';
import { initTone } from '@/audio/synth';
import { state } from '@/utils/state';
import { $ } from '@/utils/dom';
import { stopSpeaking } from './synthesis';
import { dict } from '@/i18n';

// _micStream: getUserMedia stream tenuto aperto per tutta la sessione vocale.
// Mantiene l'indicatore del microfono OS sempre attivo → evita i suoni di
// sistema (beep on/off) che scattano a ogni restart di SpeechRecognition.

const SR = (
  window as Window & {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
).SpeechRecognition || (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

let recognition: SpeechRecognition | null = null;
let micStream: MediaStream | null = null;

// Callback che matcha il transcript con comandi e risposte. Iniettata dal
// livello UI (quiz/home) per evitare dipendenze circolari verso matchVoice.
export type TranscriptHandler = (transcript: string) => void;
let onTranscript: TranscriptHandler | null = null;

export function setTranscriptHandler(handler: TranscriptHandler): void {
  onTranscript = handler;
}

export function isSRSupported(): boolean {
  return !!SR;
}

export function initRecognition(): boolean {
  if (!SR) {
    dlog('SR NOT supported');
    return false;
  }
  if (recognition) return true;
  dlog('Init SR...');
  try {
    recognition = new SR();
    recognition.lang = dict().meta.srLangCode;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.onstart = (): void => {
      dlog('SR.onstart');
      updateVoiceBadge('listening');
    };
    recognition.onresult = (e: SpeechRecognitionEvent): void => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result && result.isFinal) {
          const t = result[0]?.transcript ?? '';
          dlog('Heard: "' + t + '"');
          onTranscript?.(t);
        }
      }
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent): void => {
      dlog('SR.onerror: ' + e.error);
      if (e.error === 'not-allowed') {
        updateVoiceBadge('error');
        const label = $('mic-label');
        if (label) label.textContent = dict().quiz.micDenied;
        state.voiceEnabled = false;
        const mb = $('mic-btn');
        if (mb) mb.className = 'mic-btn';
        stopMicStream();
        return;
      }
      if (e.error === 'no-speech' || e.error === 'aborted') {
        scheduleRestart(500);
      } else {
        updateVoiceBadge('error');
        scheduleRestart(1500);
      }
    };
    recognition.onend = (): void => {
      dlog('SR.onend');
      if (state.voiceEnabled) scheduleRestart(300);
      else updateVoiceBadge('off');
    };
    return true;
  } catch (err) {
    dlog('SR init error: ' + (err as Error).message);
    return false;
  }
}

function stopMicStream(): void {
  if (micStream) {
    micStream.getTracks().forEach((t) => t.stop());
    micStream = null;
  }
  if (pendingRestart) {
    clearTimeout(pendingRestart);
    pendingRestart = null;
  }
}

// Acquire (or re-acquire) the persistent mic stream used to suppress the
// OS recognition beep on every SR restart. The stream is held open for
// the entire voice session so SpeechRecognition.start() reuses it instead
// of doing its own short-lived getUserMedia each time. Idempotent: a
// no-op if the stream is already live. Resolves true on success, false
// if the browser denied permission.
//
// Constraints note: we explicitly opt out of echoCancellation,
// noiseSuppression and autoGainControl. With the defaults (all true)
// some Android builds switch the audio session to "communication" mode,
// which suspends the Tone.js output context → quiz audio + maestro TTS
// go silent. Asking for a "raw" mic keeps the session in "media" mode
// and playback continues normally.
export async function acquireMicStream(): Promise<boolean> {
  if (micStream) return true;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    return true;
  } catch (err) {
    dlog('acquireMicStream failed: ' + (err as Error).message);
    const name = (err as { name?: string }).name;
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      const ml = $('mic-label');
      if (ml) ml.textContent = dict().quiz.micDenied;
    }
    return false;
  }
}

export function startVoice(): void {
  if (!recognition || !state.voiceEnabled) return;
  try {
    recognition.start();
  } catch {
    /* ignore — already running */
  }
}

// Restart SR only once the synth/TTS pipeline has gone quiet. Each
// SR.start() can trigger a brief OS "listening" beep on Android, so we
// bunch restarts to between-audio gaps. Polls every 400ms while audio
// is busy; bails out cleanly if voice gets disabled meanwhile.
let pendingRestart: ReturnType<typeof setTimeout> | null = null;
function scheduleRestart(initialDelay: number): void {
  if (!state.voiceEnabled) return;
  if (pendingRestart) clearTimeout(pendingRestart);
  const tick = (): void => {
    pendingRestart = null;
    if (!state.voiceEnabled) return;
    if (state.isPlaying || state.isSpeaking) {
      pendingRestart = setTimeout(tick, 400);
      return;
    }
    startVoice();
  };
  pendingRestart = setTimeout(tick, initialDelay);
}

export async function toggleVoice(): Promise<void> {
  await initTone();
  if (!SR) {
    alert(dict().meta.browserNoSR);
    return;
  }
  if (state.voiceEnabled) {
    state.voiceEnabled = false;
    try {
      recognition?.stop();
    } catch {
      /* ignore */
    }
    stopMicStream();
    updateVoiceBadge('off');
    const mb = $('mic-btn');
    if (mb) mb.className = 'mic-btn';
    const ml = $('mic-label');
    if (ml) ml.textContent = dict().quiz.micTap;
    const vab = $('voice-advance-row');
    if (vab) vab.style.display = 'none';
    const vb = $('voice-badge');
    if (vb) vb.style.display = 'none';
  } else {
    if (!(await acquireMicStream())) return;
    if (!initRecognition()) return;
    state.voiceEnabled = true;
    const mb = $('mic-btn');
    if (mb) mb.className = 'mic-btn on';
    const ml = $('mic-label');
    if (ml) ml.textContent = dict().quiz.micActive;
    const vab = $('voice-advance-row');
    if (vab) vab.style.display = 'flex';
    const vb = $('voice-badge');
    if (vb) vb.style.display = 'flex';
    startVoice();
  }
}

export function stopVoice(): void {
  if (state.voiceEnabled) {
    state.voiceEnabled = false;
    try {
      recognition?.stop();
    } catch {
      /* ignore */
    }
  }
}

export function toggleAutoAdvance(): void {
  state.autoAdvance = !state.autoAdvance;
  const t = $('voice-advance-toggle');
  if (t) t.className = 'toggle-sw ' + (state.autoAdvance ? 'on' : 'off');
}

export type VoiceBadgeState = 'off' | 'listening' | 'error';

export function updateVoiceBadge(badgeState: VoiceBadgeState): void {
  const b = $('voice-badge');
  const d = $('voice-dot');
  const t = $('voice-text');
  if (!b || !d || !t) return;
  if (badgeState === 'off') {
    b.style.display = 'none';
    return;
  }
  b.style.display = 'flex';
  b.className = 'voice-badge' + (badgeState === 'listening' ? ' listening' : '');
  d.className = 'voice-dot' + (badgeState === 'listening' ? ' listening' : '');
  d.style.background = badgeState === 'error' ? 'var(--wrong)' : '';
  const vb_ = dict().voiceBadge;
  t.textContent =
    badgeState === 'listening' ? vb_.listening : badgeState === 'error' ? vb_.error : vb_.dots;
}

export function showHeard(text: string): void {
  const vt = $('voice-text');
  const vb = $('voice-badge');
  const d = $('voice-dot');
  if (!vt || !vb || !d) return;
  vt.textContent = text;
  vb.className = 'voice-badge';
  d.className = 'voice-dot';
  d.style.background = 'var(--correct)';
  setTimeout(() => {
    if (state.voiceEnabled) {
      updateVoiceBadge('listening');
      d.style.background = '';
    }
  }, 1800);
}

// Helper per chi usa recognition dall'esterno (welcome che lo riaccende).
export function forceStop(): void {
  try {
    recognition?.stop();
  } catch {
    /* ignore */
  }
  stopMicStream();
}

// Re-exported for visibilitychange handler in main.ts
export function _internalStopSpeakingHook(): void {
  stopSpeaking();
}
