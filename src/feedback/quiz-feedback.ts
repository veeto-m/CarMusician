import type { Direction, QuestionType, QuizItem } from '@/types';
import { randomInt } from '@/data/notes';
import { playItemFromBase } from '@/audio/player';
import { speak, warmTTS } from '@/voice/synthesis';
import { bumpVoiceMute, isStaleGen, state } from '@/utils/state';
import { $ } from '@/utils/dom';
import { updatePlayBtn } from '@/ui/components/play-btn';
import { dict } from '@/i18n';
import { pickConfusedLine, pickExplainLine } from './maestro-pool';

// Stato condiviso fra showWrongFeedback e playSonicCompare: l'utente può
// ri-premere i due bottoni (tua / giusta) per riascoltare a piacere.
interface SonicData {
  selected: QuizItem;
  correct: QuizItem;
  type: QuestionType;
  dir: Direction;
  base: number;
}
let sonicData: SonicData | null = null;

// Wrong-answer audio script: announce the correct answer, then contrast
// ("X sounds like this" → "while this is Y"). Localized via dict().
function wrongScript(
  selectedOpt: QuizItem,
  correctOpt: QuizItem,
  type: QuestionType
): { a: string; b: string } {
  return dict().quiz.wrongScript({
    wrongName: selectedOpt.name,
    rightName: correctOpt.name,
    type,
  });
}

export async function showWrongFeedback(
  selectedOpt: QuizItem,
  correctOpt: QuizItem,
  questionType: QuestionType,
  direction: Direction
): Promise<void> {
  const gen = state.audioGen;
  const fb = $('quiz-feedback');
  if (!fb) return;
  const fbDict = dict().quiz.feedback;

  // Pick the maestro line up front so the DOM can show it immediately.
  const aiText = pickConfusedLine(questionType, correctOpt, direction);

  fb.innerHTML = `<div class="feedback ko">
    <div class="feedback-text" style="color:var(--wrong);">${fbDict.wrong}</div>
    <div class="feedback-detail">${fbDict.was} <strong style="color:var(--text);">${correctOpt.name}</strong></div>
    <div class="sonic-compare">
      <button class="sonic-btn" data-compare="selected">▶ ${selectedOpt.abbr} (${fbDict.yours})</button>
      <button class="sonic-btn" data-compare="correct">▶ ${correctOpt.abbr} (${fbDict.correctLabel})</button>
    </div>
    <div class="ai-insight" id="ai-insight"><div class="ai-label">${fbDict.maestroLabel}</div><div${
      aiText ? '' : ' style="color:var(--textDim);"'
    }>${aiText ?? fbDict.notAvailable}</div></div>
  </div>`;

  fb.querySelectorAll<HTMLButtonElement>('.sonic-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const which = btn.dataset.compare as 'selected' | 'correct';
      playSonicCompare(which);
    });
  });

  // Una base condivisa per i due confronti (per scale/accordi è importante
  // che la tonica sia la stessa così si sente bene la differenza).
  const shareBase = questionType === 'interval' ? state.lastBaseMidi : randomInt(48, 60);
  sonicData = { selected: selectedOpt, correct: correctOpt, type: questionType, dir: direction, base: shareBase };

  // Ogni speak/play controlla la generazione: se l'utente ha premuto "next"
  // o si è tornati in home, non parte niente. Durante i toni di confronto
  // impostiamo isPlaying=true + estendiamo la dead-zone del mic: altrimenti
  // SR può scambiare il synth per un comando ("avanti") → nextQuestion
  // prematuro → il resto del feedback viene saltato.
  const playCompare = async (opt: QuizItem): Promise<void> => {
    const d = playItemFromBase(questionType, opt, shareBase, direction);
    state.isPlaying = true;
    updatePlayBtn();
    bumpVoiceMute(d + 700);
    await new Promise((r) => setTimeout(r, d));
    state.isPlaying = false;
    updatePlayBtn();
    bumpVoiceMute(400);
  };

  const ws = wrongScript(selectedOpt, correctOpt, questionType);

  // Pre-fetch the maestro TTS in parallel with the comparison so the
  // network round-trip is hidden behind audio that's already playing.
  if (aiText) void warmTTS(aiText);

  // Run the feedback sequence fully awaited so isSpeaking / isPlaying stay
  // high throughout and scheduleAutoNext's poller can never slip through a
  // between-steps gap. Each await is gated by isStaleGen(gen) so that
  // stopAllAudio (next / goHome) cleanly aborts the pipeline.
  if (isStaleGen(gen)) return;
  await speak(ws.a);
  if (isStaleGen(gen)) return;
  await playCompare(selectedOpt);
  if (isStaleGen(gen)) return;
  await speak(ws.b);
  if (isStaleGen(gen)) return;
  await playCompare(correctOpt);
  if (isStaleGen(gen)) return;
  if (aiText) await speak(aiText);
}

export async function showCorrectFeedback(): Promise<void> {
  const gen = state.audioGen;
  const fb = $('quiz-feedback');
  if (!fb) return;
  const fbDict = dict().quiz.feedback;
  fb.innerHTML = `<div class="feedback ok"><div class="feedback-text" style="color:var(--correct);">${fbDict.correct}</div></div>`;

  // Pick the optional streak-bonus line BEFORE speaking "Corretto!" so we
  // can pre-fetch its TTS in parallel and avoid the gap before it plays.
  let aiText: string | null = null;
  if (state.stats.streak > 0 && state.stats.streak % 3 === 0 && state.currentQ) {
    aiText = pickExplainLine(
      state.currentQ.type,
      state.currentQ.answer,
      state.currentQ.direction
    );
    if (aiText) void warmTTS(aiText);
  }

  await speak(fbDict.correctAnnouncement);
  if (isStaleGen(gen)) return;
  if (aiText) {
    fb.innerHTML += `<div class="ai-insight"><div class="ai-label">${fbDict.maestroLabel}</div><div>${aiText}</div></div>`;
    await speak(aiText);
  }
}

export function playSonicCompare(which: 'selected' | 'correct'): void {
  if (!sonicData) return;
  const opt = which === 'selected' ? sonicData.selected : sonicData.correct;
  playItemFromBase(sonicData.type, opt, sonicData.base, sonicData.dir);
}
