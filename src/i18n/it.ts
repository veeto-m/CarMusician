import type { Dictionary } from './types';

export const it: Dictionary = {
  meta: {
    htmlLang: 'it',
    srLangCode: 'it-IT',
    ttsLangCode: 'it-IT',
    ttsShortCode: 'it',
    ttsVoiceLangRegex: '^it(-|_)?',
    ttsPreferredVoiceNamesRegex: 'elsa|isabella|alice|cosimo|diego|lorenzo|carla',
    dateLocale: 'it-IT',
    appName: 'CarMusician',
    browserNoSR: 'Browser non supporta riconoscimento vocale.',
  },

  voiceBadge: {
    listening: 'IN ASCOLTO',
    error: 'ERRORE',
    dots: '...',
  },

  welcome: {
    claim: 'allena l\'orecchio a mani libere',
    tapToStartLine1: 'Tocca per iniziare.',
    tapToStartLine2: "L'app partirà in modalità audio.",
    boot: 'Benvenuto in CarMusician! Cosa vuoi fare? Quiz intervalli, quiz scale, o auto training?',
  },

  links: {
    betaText: 'Versione di pre-rilascio',
    instructionsSourceLabel: 'Istruzioni e codice sorgente',
    feedbackLabel: 'Feedback e segnalazione bug',
  },

  home: {
    subtitle: 'allena l\'orecchio a mani libere',
    section: {
      quiz: 'Quiz',
      listening: 'Ascolto',
      reference: 'Riferimento',
      progress: 'Progressi',
      settings: 'Impostazioni',
      about: 'Informazioni',
    },
    card: {
      intervalsLabel: 'Quiz Intervalli',
      intervalsDesc: 'Riconosci la distanza tra due note',
      scalesLabel: 'Quiz Scale',
      scalesDesc: 'Identifica il modo o la scala',
      chordsLabel: 'Quiz Accordi',
      chordsDesc: "Triadi e quadriadi: riconosci l'accordo",
      autoLabel: 'Auto Training',
      autoDesc: 'Ascolto passivo: suona + dice il nome.<br>Perfetto in auto, a mani libere.',
      referenceLabel: 'Scale e Modi',
      referenceDesc: 'Esplora e ascolta ogni scala e modo',
      statsLabel: 'Le mie statistiche',
      statsEmpty: 'Nessuna sessione ancora — inizia un quiz!',
      settingsLabel: 'Impostazioni',
      settingsDesc: 'Suono, voce e preferenze',
    },
    voicePanel: {
      title: 'Vivavoce',
      hint: 'Attiva il microfono per controllare l\'app a voce.<br>Riproduzione: "riascolta", "avanti", "zitto".<br>Navigazione: "intervalli", "scale", "accordi", "auto training", "indietro", "chiudi app".<br>Difficoltà: "facile", "medio", "difficile", "custom".<br>Risposte: pronuncia il nome (es. "terza minore", "dorica", "settima maggiore").',
    },
    statsSummary: (answered, pct, days) => {
      const label = days === 1 ? 'giorno' : 'giorni';
      return `${answered} risposte · ${pct}% · ${days} ${label}`;
    },
  },

  quiz: {
    title: {
      intervals: 'Quiz Intervalli',
      chords: 'Quiz Accordi',
      scales: 'Quiz Scale',
      fallback: 'Quiz',
    },
    statLabels: { correct: 'Corrette', pct: '%', streak: 'Serie', best: 'Record' },
    difficulty: {
      easy: 'Facile',
      medium: 'Medio',
      hard: 'Difficile',
      custom: 'Custom',
      customHint: 'tocca per attivare/disattivare',
    },
    micTap: 'Tap per attivare il vivavoce',
    micActive: 'Vivavoce attivo — parla!',
    micDenied: 'Permesso microfono negato.',
    autoAdvance: 'Auto-avanza dopo risposta',
    hint: { playing: 'ascolta...', voice: 'di\' "riascolta" o tap', normal: 'riascolta' },
    next: { normal: 'PROSSIMA →', voice: 'PROSSIMA → (o di\' "avanti")' },
    silenceMaestro: '✕ silenzia maestro',
    historyEmpty: 'Nessuna risposta',
    direction: {
      interval: {
        ascending: '↑ ascendente',
        descending: '↓ discendente',
        harmonic: '⟷ armonico',
      },
      chordAsc: '↑ arpeggio sale',
      chordDesc: '↓ arpeggio scende',
      scaleAsc: '↑ ascendente',
      scaleDesc: '↓ discendente',
    },
    feedback: {
      correct: 'Corretto!',
      wrong: 'Sbagliato',
      was: 'Era:',
      yours: '(tua)',
      correctLabel: '(giusta)',
      thinking: 'sta pensando...',
      notAvailable: 'Non disponibile al momento.',
      maestroLabel: '✦ maestro',
      correctAnnouncement: 'Corretto!',
    },
    wrongScript: ({ wrongName, rightName, type }) => {
      if (type === 'chord') {
        return {
          a: `Sbagliato, era ${rightName}. Il ${wrongName} suona così`,
          b: `mentre questo è ${rightName}`,
        };
      }
      return {
        a: `Sbagliato, era ${rightName}. La ${wrongName} suona così`,
        b: `mentre questa è la ${rightName}`,
      };
    },
  },

  auto: {
    title: 'Auto Training',
    content: { intervals: 'Intervalli', scales: 'Scale', chords: 'Accordi', mix: 'Mix' },
    speed: { label: 'Velocità:', slow: 'Lenta', normal: 'Normale', fast: 'Veloce' },
    pauseLabel: 'Pausa tra elementi',
    explainLabel: 'Spiegazioni del maestro',
    idle: 'Premi play per iniziare.<br>Suona → annuncia → ripete per rinforzo.',
    status: {
      playing: '♪ suona...',
      announcing: 'annuncia...',
      repeating: '♪ ripete...',
      maestro: '✦ il maestro...',
      paused: 'pausa...',
    },
  },

  reference: {
    title: 'Scale e Modi',
    intervalsSection: 'Intervalli',
    listenButton: '▶ ascolta',
    family: {
      Modo: 'Modo',
      Minore: 'Minore',
      Pentatonica: 'Pentatonica',
      Blues: 'Blues',
    },
  },

  settings: {
    title: 'Impostazioni',
    themeSection: 'Tema',
    palette: 'Palette colore',
    themeNames: {
      espresso: 'espresso · warm amber',
      concert: 'concert · gold & oxblood',
      jazz: 'jazz club · coral on navy',
      forest: 'forest · moss & amber',
      midnight: 'midnight · blue & gold',
      vinyl: 'vinyl · cream day',
    },
    themeSwatches: {
      espresso: 'Espresso — arancio caldo',
      concert: 'Concert — oro + bordeaux',
      jazz: 'Jazz Club — corallo + navy',
      forest: 'Forest — muschio + ambra',
      midnight: 'Midnight — giallo + blu',
      vinyl: 'Vinyl — giorno, carta crema',
    },
    soundSection: 'Suono',
    instrument: 'Strumento',
    piano: 'Pianoforte',
    synth: 'Synth',
    pianoLoading: 'Caricamento campioni pianoforte...',
    voiceSection: 'Voce',
    naturalTTS: 'TTS naturale (Google)',
    naturalTTSDesc: 'Se attivo, usa la voce Google (più naturale).<br>Se disattivo, usa la voce del dispositivo.',
    voiceInfo: {
      google: 'Voce: Google Translate TTS',
      device: (name: string) => `Voce dispositivo: ${name}`,
      none: 'Nessuna voce italiana trovata',
    },
    languageSection: 'Lingua',
    languageNames: { en: 'English', it: 'Italiano' },
  },

  stats: {
    title: 'Statistiche',
    labels: { total: 'Risposte', accuracy: 'Accuratezza', days: 'Giorni', best: 'Record' },
    fortnight: 'Ultime 2 settimane',
    chartHint: 'altezza = % correttezza giornaliera',
    tabs: { intervals: 'Intervalli', scales: 'Scale', chords: 'Accordi' },
    resetButton: 'Azzera statistiche',
    resetConfirm: "Sei sicuro di voler azzerare tutte le statistiche? L'operazione è irreversibile.",
  },

  voiceCommands: {
    silence: ['zitto', 'basta', 'silenzio', 'stop'],
    next: ['avanti', 'prossima', 'prossimo', 'next', 'vai', 'continua'],
    replay: ['riascolta', 'replay', 'ripeti', 'risenti', 'ancora'],
    back: ['indietro', 'torna indietro', 'menu', 'menù', 'esci dal quiz'],
    closeApp: ['chiudi app', 'chiudi applicazione', 'spegni app', 'spegni applicazione'],
    diffEasy: ['facile', 'facilita', 'livello facile'],
    diffMedium: ['medio', 'livello medio', 'media'],
    diffHard: ['difficile', 'livello difficile', 'duro'],
    diffCustom: ['custom', 'personalizzato', 'personalizzata'],
    goIntervals: ['intervalli', 'quiz intervalli'],
    goChords: ['accordi', 'quiz accordi', 'triadi', 'quadriadi'],
    goScales: ['scale', 'quiz scale', 'modi'],
    goAuto: ['auto training', 'training', 'ascolto', 'passivo'],
  },

  mediaSession: {
    title: 'CarMusician',
    artist: 'Maestro',
    album: 'Allenamento uditivo',
  },


  data: {
    intervals: {
      '1': { name: 'Unisono', va: ['unisono', 'prima'] },
      '2m': { name: 'Seconda minore', va: ['seconda minore', 'semitono'] },
      '2M': { name: 'Seconda maggiore', va: ['seconda maggiore', 'seconda'] },
      '3m': { name: 'Terza minore', va: ['terza minore'] },
      '3M': { name: 'Terza maggiore', va: ['terza maggiore'] },
      '4': { name: 'Quarta giusta', va: ['quarta giusta', 'quarta'] },
      TT: { name: 'Tritono', va: ['tritono', 'quarta aumentata', 'quinta diminuita'] },
      '5': { name: 'Quinta giusta', va: ['quinta giusta', 'quinta'] },
      '6m': { name: 'Sesta minore', va: ['sesta minore'] },
      '6M': { name: 'Sesta maggiore', va: ['sesta maggiore', 'sesta'] },
      '7m': { name: 'Settima minore', va: ['settima minore'] },
      '7M': { name: 'Settima maggiore', va: ['settima maggiore'] },
      '8': { name: 'Ottava', va: ['ottava'] },
    },
    scales: {
      Mag: {
        name: 'Maggiore (Ionica)',
        desc: 'Luminosa e stabile. Base del sistema tonale occidentale.',
        va: ['maggiore', 'ionica'],
      },
      min: {
        name: 'Minore naturale (Eolia)',
        desc: 'Malinconica e scura. Relativa minore della maggiore.',
        va: ['minore naturale', 'minore', 'eolia'],
      },
      'm.arm': {
        name: 'Minore armonica',
        desc: 'Tensione esotica. Settimo grado alzato crea il sensibile.',
        va: ['minore armonica', 'armonica'],
      },
      'm.mel': {
        name: 'Minore melodica',
        desc: 'Fluida in salita. Sesto e settimo grado alzati.',
        va: ['minore melodica', 'melodica'],
      },
      Dor: {
        name: 'Dorica',
        desc: 'Minore ma con sesta maggiore. Jazz, funk, folk.',
        va: ['dorica', 'dorico'],
      },
      Fri: {
        name: 'Frigia',
        desc: 'Scura, spagnola. Seconda minore caratteristica.',
        va: ['frigia', 'frigio'],
      },
      Lid: {
        name: 'Lidia',
        desc: 'Sognante, luminosa. Quarta aumentata caratteristica.',
        va: ['lidia', 'lidio'],
      },
      Mix: {
        name: 'Misolidia',
        desc: 'Blues, rock. Come maggiore ma con settima minore.',
        va: ['misolidia', 'misolidio', 'mixolidia', 'mixolidio'],
      },
      Loc: {
        name: 'Locria',
        desc: 'Instabile e tesa. Quinta diminuita. Rara in pratica.',
        va: ['locria', 'locrio'],
      },
      Pent: {
        name: 'Pentatonica maggiore',
        desc: 'Universale, aperta. Cinque note senza tensioni.',
        va: ['pentatonica', 'pentatonica maggiore'],
      },
      PentM: {
        name: 'Pentatonica minore',
        desc: 'Rock e blues. Cinque note, sapore minore.',
        va: ['pentatonica minore'],
      },
      Blues: {
        name: 'Blues',
        desc: 'Pentatonica minore + blue note (tritono).',
        va: ['blues', 'blus'],
      },
    },
    chords: {
      M: {
        name: 'Maggiore',
        desc: 'Luminosa e stabile. Terza maggiore + quinta giusta.',
        va: ['maggiore', 'major'],
      },
      m: {
        name: 'Minore',
        desc: 'Malinconica. Terza minore + quinta giusta.',
        va: ['minore', 'minor'],
      },
      dim: {
        name: 'Diminuita',
        desc: 'Tesa, instabile. Due terze minori sovrapposte.',
        va: ['diminuita', 'diminuito', 'dim'],
      },
      aug: {
        name: 'Aumentata',
        desc: 'Sospesa, misteriosa. Due terze maggiori sovrapposte.',
        va: ['aumentata', 'aumentato', 'aug'],
      },
      Maj7: {
        name: 'Settima maggiore',
        desc: 'Sognante, jazz. Triade maggiore + settima maggiore.',
        va: ['settima maggiore', 'maggiore settima', 'maj7', 'major seven'],
      },
      m7: {
        name: 'Minore settima',
        desc: 'Intima, jazz/soul. Triade minore + settima minore.',
        va: ['minore settima', 'minore sette', 'm7', 'minor seven'],
      },
      '7': {
        name: 'Settima di dominante',
        desc: 'Tensione che chiede risoluzione. Maggiore + settima minore.',
        va: ['settima di dominante', 'dominante', 'settima', 'seven', 'dominant'],
      },
      m7b5: {
        name: 'Semidiminuita',
        desc: 'Ambigua, jazz. Diminuita + settima minore.',
        va: ['semidiminuita', 'm7 bemolle 5', 'm7b5', 'mezza diminuita', 'half diminished'],
      },
      dim7: {
        name: 'Diminuita settima',
        desc: 'Tensissima, simmetrica. Tre terze minori.',
        va: ['diminuita settima', 'dim7', 'fully diminished'],
      },
      mMaj7: {
        name: 'Minore-maggiore 7',
        desc: 'Noir, hitchcockiana. Minore + settima maggiore.',
        va: ['minore maggiore sette', 'minore maggiore settima', 'm maj 7', 'mmaj7'],
      },
    },
    scaleFamily: {
      Modo: 'Modo',
      Minore: 'Minore',
      Pentatonica: 'Pentatonica',
      Blues: 'Blues',
    },
    chordFamily: {
      Triade: 'Triade',
      Quadriade: 'Quadriade',
    },
  },
};
