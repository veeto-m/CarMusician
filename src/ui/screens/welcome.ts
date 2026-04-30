import { initTone } from '@/audio/synth';
import { startKeepAlive } from '@/audio/keep-alive';
import { acquireWakeLock } from '@/audio/wake-lock';
import { speak } from '@/voice/synthesis';
import { initRecognition, isSRSupported, startVoice } from '@/voice/recognition';
import { dlog } from '@/ui/debug';
import { $ } from '@/utils/dom';
import { state } from '@/utils/state';
import { showScreen } from '@/app';
import { dict } from '@/i18n';

export async function startApp(): Promise<void> {
  await initTone();
  await startKeepAlive();
  await acquireWakeLock();

  const circle = $('welcome-circle');
  if (circle) circle.classList.add('active');
  await speak(dict().welcome.boot);
  if (circle) circle.classList.remove('active');
  showScreen('home');

  // Voice on the splash path: let SpeechRecognition do its own internal
  // getUserMedia. Pre-opening a separate MediaStream conflicted with
  // SR on Android (two simultaneous audio captures → SR couldn't start
  // and the mic stayed dead). Manual toggleVoice from the quiz screen
  // still calls acquireMicStream because that path triggers off a user
  // gesture and SR is already alive.
  if (isSRSupported()) {
    if (!initRecognition()) return;
    state.voiceEnabled = true;
    const vb = $('voice-badge');
    if (vb) vb.style.display = 'flex';
    startVoice();
    dlog('Voice-first mode active on home');
  }
}
