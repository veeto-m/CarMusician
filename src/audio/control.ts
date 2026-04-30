import {
  getDelayedSpeakTimer,
  getPlayEndTimer,
  setDelayedSpeakTimer,
  setPlayEndTimer,
  stopSpeaking,
} from '@/voice/synthesis';
import { bumpVoiceMute, freshGen, state } from '@/utils/state';
import { resetSynthHard } from './synth';

// Stop totale audio: sintetizzatore + voce + timers. Usato quando si passa
// al quiz successivo o si torna in home con audio ancora in corso. Aumenta
// l'audioGen così i callback async in volo (aiText ritardato, scheduleAutoNext)
// si auto-cancellano quando controllano la generazione.
export function stopAllAudio(): void {
  freshGen();
  stopSpeaking();
  const pet = getPlayEndTimer();
  if (pet) {
    clearTimeout(pet);
    setPlayEndTimer(null);
  }
  const dst = getDelayedSpeakTimer();
  if (dst) {
    clearTimeout(dst);
    setDelayedSpeakTimer(null);
  }
  resetSynthHard();
  state.isPlaying = false;
  bumpVoiceMute();
}
