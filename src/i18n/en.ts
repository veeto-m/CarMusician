import type { Dictionary } from './types';

export const en: Dictionary = {
  meta: {
    htmlLang: 'en',
    srLangCode: 'en-US',
    ttsLangCode: 'en-US',
    ttsShortCode: 'en',
    ttsVoiceLangRegex: '^en(-|_)?',
    ttsPreferredVoiceNamesRegex: 'samantha|aria|jenny|guy|natasha|ryan|ava|emma',
    dateLocale: 'en-US',
    appName: 'CarMusician',
    browserNoSR: 'Browser does not support speech recognition.',
  },

  voiceBadge: {
    listening: 'LISTENING',
    error: 'ERROR',
    dots: '...',
  },

  welcome: {
    claim: 'train your ear hands-free',
    tapToStartLine1: 'Tap to start.',
    tapToStartLine2: 'The app will launch in audio mode.',
    boot: 'Welcome to CarMusician! What would you like to do? Interval quiz, scale quiz, or auto training?',
  },

  home: {
    subtitle: 'train your ear hands-free',
    section: {
      quiz: 'Quiz',
      listening: 'Listening',
      reference: 'Reference',
      progress: 'Progress',
      settings: 'Settings',
    },
    card: {
      intervalsLabel: 'Interval Quiz',
      intervalsDesc: 'Recognize the distance between two notes',
      scalesLabel: 'Scale Quiz',
      scalesDesc: 'Identify the mode or the scale',
      chordsLabel: 'Chord Quiz',
      chordsDesc: 'Triads and tetrads: name the chord',
      autoLabel: 'Auto Training',
      autoDesc: 'Passive listening: plays + names.<br>Perfect for in-car, hands-free use.',
      referenceLabel: 'Scales & Modes',
      referenceDesc: 'Explore and listen to every scale and mode',
      statsLabel: 'My statistics',
      statsEmpty: 'No sessions yet — start a quiz!',
      settingsLabel: 'Settings',
      settingsDesc: 'Sound, voice and preferences',
    },
    voicePanel: {
      title: 'Hands-free',
      hint: 'In quizzes, enable the mic to answer by voice. Commands: "replay", "next".',
    },
    statsSummary: (answered, pct, days) => {
      const label = days === 1 ? 'day' : 'days';
      return `${answered} answers · ${pct}% · ${days} ${label}`;
    },
  },

  quiz: {
    title: {
      intervals: 'Interval Quiz',
      chords: 'Chord Quiz',
      scales: 'Scale Quiz',
      fallback: 'Quiz',
    },
    statLabels: { correct: 'Correct', pct: '%', streak: 'Streak', best: 'Best' },
    difficulty: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      custom: 'Custom',
      customHint: 'tap to toggle',
    },
    micTap: 'Tap to enable hands-free',
    micActive: 'Hands-free active — speak!',
    micDenied: 'Microphone permission denied.',
    autoAdvance: 'Auto-advance after answer',
    hint: { playing: 'listen...', voice: 'say "replay" or tap', normal: 'replay' },
    next: { normal: 'NEXT →', voice: 'NEXT → (or say "next")' },
    silenceMaestro: '✕ silence maestro',
    historyEmpty: 'No answers yet',
    direction: {
      interval: {
        ascending: '↑ ascending',
        descending: '↓ descending',
        harmonic: '⟷ harmonic',
      },
      chordAsc: '↑ arpeggio up',
      chordDesc: '↓ arpeggio down',
      scaleAsc: '↑ ascending',
      scaleDesc: '↓ descending',
    },
    feedback: {
      correct: 'Correct!',
      wrong: 'Wrong',
      was: 'Was:',
      yours: '(yours)',
      correctLabel: '(correct)',
      thinking: 'thinking...',
      notAvailable: 'Not available right now.',
      maestroLabel: '✦ maestro',
      correctAnnouncement: 'Correct!',
    },
    wrongScript: ({ wrongName, rightName, type }) => {
      if (type === 'chord') {
        return {
          a: `Wrong, it was ${rightName}. The ${wrongName} sounds like this`,
          b: `while this is the ${rightName}`,
        };
      }
      return {
        a: `Wrong, it was ${rightName}. The ${wrongName} sounds like this`,
        b: `while this is the ${rightName}`,
      };
    },
  },
  auto: {
    title: 'Auto Training',
    content: { intervals: 'Intervals', scales: 'Scales', chords: 'Chords', mix: 'Mix' },
    speed: { label: 'Speed:', slow: 'Slow', normal: 'Normal', fast: 'Fast' },
    pauseLabel: 'Pause between items',
    explainLabel: 'Maestro explanations',
    idle: 'Press play to start.<br>Plays → announces → repeats to reinforce.',
    status: {
      playing: '♪ playing...',
      announcing: 'announcing...',
      repeating: '♪ replaying...',
      maestro: '✦ the maestro...',
      paused: 'paused...',
    },
  },
  reference: {
    title: 'Scales & Modes',
    intervalsSection: 'Intervals',
    listenButton: '▶ listen',
    family: {
      Modo: 'Mode',
      Minore: 'Minor',
      Pentatonica: 'Pentatonic',
      Blues: 'Blues',
    },
  },
  settings: {
    title: 'Settings',
    themeSection: 'Theme',
    palette: 'Color palette',
    themeNames: {
      espresso: 'espresso · warm amber',
      concert: 'concert · gold & oxblood',
      jazz: 'jazz club · coral on navy',
      forest: 'forest · moss & amber',
      midnight: 'midnight · blue & gold',
      vinyl: 'vinyl · cream day',
    },
    themeSwatches: {
      espresso: 'Espresso — warm amber',
      concert: 'Concert — gold & oxblood',
      jazz: 'Jazz Club — coral & navy',
      forest: 'Forest — moss & amber',
      midnight: 'Midnight — gold & blue',
      vinyl: 'Vinyl — daytime cream paper',
    },
    soundSection: 'Sound',
    instrument: 'Instrument',
    piano: 'Piano',
    synth: 'Synth',
    pianoLoading: 'Loading piano samples...',
    voiceSection: 'Voice',
    naturalTTS: 'Natural TTS (Google)',
    naturalTTSDesc: 'If on, uses the Google voice (more natural).<br>If off, uses the device voice.',
    voiceInfo: {
      google: 'Voice: Google Translate TTS',
      device: (name: string) => `Device voice: ${name}`,
      none: 'No English voice found',
    },
    languageSection: 'Language',
    languageNames: { en: 'English', it: 'Italiano' },
  },
  stats: {
    title: 'Statistics',
    labels: { total: 'Answers', accuracy: 'Accuracy', days: 'Days', best: 'Best' },
    fortnight: 'Last 2 weeks',
    chartHint: 'height = daily accuracy %',
    tabs: { intervals: 'Intervals', scales: 'Scales', chords: 'Chords' },
    resetButton: 'Reset statistics',
    resetConfirm: 'Are you sure you want to reset all statistics? This cannot be undone.',
  },
  voiceCommands: {
    silence: ['quiet', 'stop', 'silence', 'shut up'],
    next: ['next', 'forward', 'go', 'continue', 'skip'],
    replay: ['replay', 'again', 'repeat', 'once more'],
    back: ['back', 'go back', 'menu', 'exit quiz'],
    closeApp: ['close app', 'close the app', 'shut down', 'quit app', 'quit'],
    diffEasy: ['easy', 'easy level'],
    diffMedium: ['medium', 'medium level'],
    diffHard: ['hard', 'hard level', 'difficult'],
    diffCustom: ['custom', 'custom level'],
    goIntervals: ['intervals', 'interval quiz'],
    goChords: ['chords', 'chord quiz', 'triads', 'tetrads'],
    goScales: ['scales', 'scale quiz', 'modes'],
    goAuto: ['auto training', 'training', 'listen', 'passive'],
  },
  mediaSession: {
    title: 'CarMusician',
    artist: 'Maestro',
    album: 'CarMusician Session',
  },
  data: {
    intervals: {
      '1': { name: 'Unison', va: ['unison', 'first'] },
      '2m': { name: 'Minor second', va: ['minor second', 'semitone', 'half step'] },
      '2M': { name: 'Major second', va: ['major second', 'second', 'whole step'] },
      '3m': { name: 'Minor third', va: ['minor third'] },
      '3M': { name: 'Major third', va: ['major third'] },
      '4': { name: 'Perfect fourth', va: ['perfect fourth', 'fourth'] },
      TT: { name: 'Tritone', va: ['tritone', 'augmented fourth', 'diminished fifth'] },
      '5': { name: 'Perfect fifth', va: ['perfect fifth', 'fifth'] },
      '6m': { name: 'Minor sixth', va: ['minor sixth'] },
      '6M': { name: 'Major sixth', va: ['major sixth', 'sixth'] },
      '7m': { name: 'Minor seventh', va: ['minor seventh'] },
      '7M': { name: 'Major seventh', va: ['major seventh'] },
      '8': { name: 'Octave', va: ['octave'] },
    },
    scales: {
      Mag: {
        name: 'Major (Ionian)',
        desc: 'Bright and stable. Foundation of the Western tonal system.',
        va: ['major', 'ionian'],
      },
      min: {
        name: 'Natural minor (Aeolian)',
        desc: 'Melancholy and dark. Relative minor of the major.',
        va: ['natural minor', 'minor', 'aeolian'],
      },
      'm.arm': {
        name: 'Harmonic minor',
        desc: 'Exotic tension. Raised seventh creates the leading tone.',
        va: ['harmonic minor', 'harmonic'],
      },
      'm.mel': {
        name: 'Melodic minor',
        desc: 'Fluid going up. Raised sixth and seventh.',
        va: ['melodic minor', 'melodic'],
      },
      Dor: {
        name: 'Dorian',
        desc: 'Minor with a major sixth. Jazz, funk, folk.',
        va: ['dorian'],
      },
      Fri: {
        name: 'Phrygian',
        desc: 'Dark, Spanish. Characteristic minor second.',
        va: ['phrygian'],
      },
      Lid: {
        name: 'Lydian',
        desc: 'Dreamy, luminous. Characteristic raised fourth.',
        va: ['lydian'],
      },
      Mix: {
        name: 'Mixolydian',
        desc: 'Blues, rock. Like major but with a minor seventh.',
        va: ['mixolydian'],
      },
      Loc: {
        name: 'Locrian',
        desc: 'Unstable and tense. Diminished fifth. Rare in practice.',
        va: ['locrian'],
      },
      Pent: {
        name: 'Major pentatonic',
        desc: 'Universal, open. Five notes, no tensions.',
        va: ['pentatonic', 'major pentatonic'],
      },
      PentM: {
        name: 'Minor pentatonic',
        desc: 'Rock and blues. Five notes with a minor flavor.',
        va: ['minor pentatonic'],
      },
      Blues: {
        name: 'Blues',
        desc: 'Minor pentatonic + blue note (tritone).',
        va: ['blues'],
      },
    },
    chords: {
      M: {
        name: 'Major',
        desc: 'Bright and stable. Major third + perfect fifth.',
        va: ['major'],
      },
      m: {
        name: 'Minor',
        desc: 'Melancholy. Minor third + perfect fifth.',
        va: ['minor'],
      },
      dim: {
        name: 'Diminished',
        desc: 'Tense, unstable. Two stacked minor thirds.',
        va: ['diminished', 'dim'],
      },
      aug: {
        name: 'Augmented',
        desc: 'Suspended, mysterious. Two stacked major thirds.',
        va: ['augmented', 'aug'],
      },
      Maj7: {
        name: 'Major seventh',
        desc: 'Dreamy, jazz. Major triad + major seventh.',
        va: ['major seventh', 'maj7', 'major seven'],
      },
      m7: {
        name: 'Minor seventh',
        desc: 'Intimate, jazz/soul. Minor triad + minor seventh.',
        va: ['minor seventh', 'm7', 'minor seven'],
      },
      '7': {
        name: 'Dominant seventh',
        desc: 'Tension that seeks resolution. Major + minor seventh.',
        va: ['dominant seventh', 'dominant', 'seventh', 'seven'],
      },
      m7b5: {
        name: 'Half-diminished',
        desc: 'Ambiguous, jazz. Diminished + minor seventh.',
        va: ['half diminished', 'half-diminished', 'm7 flat 5', 'm7b5'],
      },
      dim7: {
        name: 'Diminished seventh',
        desc: 'Very tense, symmetric. Three stacked minor thirds.',
        va: ['diminished seventh', 'dim7', 'fully diminished'],
      },
      mMaj7: {
        name: 'Minor-major 7',
        desc: 'Noir, Hitchcockian. Minor + major seventh.',
        va: ['minor major seven', 'minor major seventh', 'm maj 7', 'mmaj7'],
      },
    },
    scaleFamily: {
      Modo: 'Mode',
      Minore: 'Minor',
      Pentatonica: 'Pentatonic',
      Blues: 'Blues',
    },
    chordFamily: {
      Triade: 'Triad',
      Quadriade: 'Tetrad',
    },
  },
};
