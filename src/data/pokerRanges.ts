export type Position = "UTG" | "MP" | "CO" | "BTN" | "SB" | "BB";

export type ScenarioCategory = "RFI" | "VS_OPEN" | "VS_3BET";

export interface HandFrequencies {
  raise: number; // Open Raise, 3-Bet, or 4-Bet (%)
  call: number;  // Call / Flat (%)
  fold: number;  // Fold (%)
}

export interface PreflopScenario {
  id: string;
  category: ScenarioCategory;
  title: string;
  shortTitle: string;
  heroPos: Position;
  villainPos?: Position;
  sizing: string;
  potType: string;
  gtoSummary: {
    raisePct: number;
    callPct: number;
    foldPct: number;
    totalCombosPlayed: number;
  };
  coachNotes: string[];
  keyAdjustments: string[];
  frequencies: Record<string, HandFrequencies>;
  // Simulated or PT4-derived hero frequencies for comparison mode
  pt4HeroFrequencies: Record<string, HandFrequencies>;
}

export const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;

export function getHandLabel(row: number, col: number): string {
  const r1 = RANKS[row];
  const r2 = RANKS[col];
  if (row === col) return `${r1}${r2}`;
  if (row < col) return `${r1}${r2}s`;
  return `${r2}${r1}o`;
}

export function getHandCombos(hand: string): number {
  if (hand.length === 2) return 6;
  if (hand.endsWith("s")) return 4;
  return 12;
}

export function getAll169Hands(): string[] {
  const hands: string[] = [];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      hands.push(getHandLabel(r, c));
    }
  }
  return hands;
}

// Helper to build a full 169-hand map cleanly from compact range specifications
function buildRangeMap(
  spec: {
    pureRaise?: string[];
    mixedRaise?: Record<string, number>; // hand -> raise % (rest fold unless in call)
    pureCall?: string[];
    mixedCall?: Record<string, { raise: number; call: number }>;
  }
): Record<string, HandFrequencies> {
  const map: Record<string, HandFrequencies> = {};
  const allHands = getAll169Hands();

  for (const h of allHands) {
    map[h] = { raise: 0, call: 0, fold: 100 };
  }

  if (spec.pureRaise) {
    for (const h of spec.pureRaise) {
      if (map[h]) map[h] = { raise: 100, call: 0, fold: 0 };
    }
  }

  if (spec.pureCall) {
    for (const h of spec.pureCall) {
      if (map[h]) map[h] = { raise: 0, call: 100, fold: 0 };
    }
  }

  if (spec.mixedRaise) {
    for (const [h, rPct] of Object.entries(spec.mixedRaise)) {
      if (map[h]) {
        const clamped = Math.max(0, Math.min(100, rPct));
        map[h] = { raise: clamped, call: 0, fold: 100 - clamped };
      }
    }
  }

  if (spec.mixedCall) {
    for (const [h, { raise, call }] of Object.entries(spec.mixedCall)) {
      if (map[h]) {
        const r = Math.max(0, Math.min(100, raise));
        const c = Math.max(0, Math.min(100 - r, call));
        map[h] = { raise: r, call: c, fold: Math.max(0, 100 - r - c) };
      }
    }
  }

  return map;
}

function computeSummary(freqs: Record<string, HandFrequencies>) {
  let raiseCombos = 0;
  let callCombos = 0;
  let foldCombos = 0;

  for (const [hand, f] of Object.entries(freqs)) {
    const combos = getHandCombos(hand);
    raiseCombos += (combos * f.raise) / 100;
    callCombos += (combos * f.call) / 100;
    foldCombos += (combos * f.fold) / 100;
  }

  const total = 1326;
  return {
    raisePct: Number(((raiseCombos / total) * 100).toFixed(1)),
    callPct: Number(((callCombos / total) * 100).toFixed(1)),
    foldPct: Number(((foldCombos / total) * 100).toFixed(1)),
    totalCombosPlayed: Math.round(raiseCombos + callCombos),
  };
}

// Create realistic PT4 Hero deviations from a GTO range (e.g., Hero under-3bets suited wheel aces, over-calls offsuit broadways)
function buildHeroDeviation(
  gto: Record<string, HandFrequencies>,
  mode: "RFI" | "VS_OPEN_IP" | "VS_OPEN_BB" | "VS_3BET"
): Record<string, HandFrequencies> {
  const hero: Record<string, HandFrequencies> = {};
  for (const [hand, f] of Object.entries(gto)) {
    let { raise, call, fold } = f;
    const isSuitedWheel = ["A5s", "A4s", "A3s", "A2s", "K7s", "K6s", "Q7s", "87s", "76s", "65s", "54s"].includes(hand);
    const isOffsuitBroadway = ["KJo", "KTo", "QJo", "QTo", "JTo", "A9o", "A8o"].includes(hand);
    const isSmallPair = ["55", "44", "33", "22"].includes(hand);

    if (mode === "RFI") {
      if (isSuitedWheel && raise > 0 && raise < 100) {
        raise = Math.max(0, raise - 30);
      } else if (isOffsuitBroadway && raise < 80 && raise > 0) {
        raise = Math.min(100, raise + 25);
      }
      call = 0;
      fold = 100 - raise;
    } else if (mode === "VS_OPEN_IP") {
      if (isSuitedWheel && raise > 0) {
        // Hero flats instead of 3-betting bluffing enough
        const shift = Math.min(raise, 45);
        raise -= shift;
        call += shift * 0.6;
      } else if (isOffsuitBroadway) {
        call = Math.min(100 - raise, call + 25);
      }
      fold = Math.max(0, 100 - raise - call);
    } else if (mode === "VS_OPEN_BB") {
      if (isSuitedWheel && raise > 0) {
        const shift = Math.min(raise, 50);
        raise -= shift;
        call += shift;
      } else if (isSmallPair && call > 0) {
        call = Math.max(0, call - 20);
      }
      fold = Math.max(0, 100 - raise - call);
    } else if (mode === "VS_3BET") {
      if (isSuitedWheel && raise > 0) {
        // Hero folds or calls instead of 4-bet bluffing A5s/A4s
        const shift = Math.min(raise, 55);
        raise -= shift;
        fold += shift;
      } else if (isSmallPair && call > 0) {
        // Over-folding or over-calling mid pairs
        call = Math.max(0, call - 25);
      }
      fold = Math.max(0, 100 - raise - call);
    }

    hero[hand] = {
      raise: Math.round(raise),
      call: Math.round(call),
      fold: Math.max(0, 100 - Math.round(raise) - Math.round(call)),
    };
  }
  return hero;
}

const utgRfiMap = buildRangeMap({
  pureRaise: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A5s", "A4s",
    "KQs", "KJs", "KTs", "K9s",
    "QJs", "QTs",
    "JTs", "T9s",
    "AKo", "AQo", "AJo", "KQo"
  ],
  mixedRaise: {
    "66": 75, "55": 50, "44": 25,
    "A7s": 65, "A6s": 45, "A3s": 75, "A2s": 50,
    "Q9s": 60, "J9s": 65, "98s": 70, "87s": 55, "76s": 45, "65s": 35,
    "ATo": 70, "KJo": 55,
  }
});

const mpRfiMap = buildRangeMap({
  pureRaise: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "KQs", "KJs", "KTs", "K9s",
    "QJs", "QTs", "Q9s",
    "JTs", "J9s", "T9s", "98s", "87s",
    "AKo", "AQo", "AJo", "ATo", "KQo", "KJo"
  ],
  mixedRaise: {
    "55": 80, "44": 55, "33": 35, "22": 20,
    "K8s": 65, "K7s": 45,
    "T8s": 50, "76s": 75, "65s": 65, "54s": 45,
    "QJo": 65, "A9o": 40,
  }
});

const coRfiMap = buildRangeMap({
  pureRaise: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "KQs", "KJs", "KTs", "K9s", "K8s", "K7s",
    "QJs", "QTs", "Q9s", "Q8s",
    "JTs", "J9s", "J8s",
    "T9s", "T8s", "98s", "87s", "76s", "65s", "54s",
    "AKo", "AQo", "AJo", "ATo", "A9o",
    "KQo", "KJo", "KTo", "QJo", "QTo", "JTo"
  ],
  mixedRaise: {
    "33": 75, "22": 60,
    "K6s": 70, "K5s": 55, "Q7s": 45, "97s": 65, "86s": 50,
    "A8o": 60, "A5o": 45, "K9o": 35,
  }
});

const btnRfiMap = buildRangeMap({
  pureRaise: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "KQs", "KJs", "KTs", "K9s", "K8s", "K7s", "K6s", "K5s", "K4s", "K3s", "K2s",
    "QJs", "QTs", "Q9s", "Q8s", "Q7s", "Q6s", "Q5s",
    "JTs", "J9s", "J8s", "J7s",
    "T9s", "T8s", "T7s",
    "98s", "97s", "96s", "87s", "86s", "76s", "75s", "65s", "64s", "54s", "53s", "43s",
    "AKo", "AQo", "AJo", "ATo", "A9o", "A8o", "A7o", "A6o", "A5o", "A4o", "A3o",
    "KQo", "KJo", "KTo", "K9o", "K8o",
    "QJo", "QTo", "Q9o",
    "JTo", "J9o", "T9o", "98o"
  ],
  mixedRaise: {
    "Q4s": 75, "Q3s": 60, "Q2s": 45,
    "J6s": 65, "J5s": 50, "T6s": 55, "85s": 50, "74s": 45, "63s": 40,
    "A2o": 65, "K7o": 40, "Q8o": 45, "J8o": 45, "T8o": 55, "87o": 60, "76o": 45
  }
});

const sbRfiMap = buildRangeMap({
  pureRaise: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "KQs", "KJs", "KTs", "K9s", "K8s", "K7s", "K6s", "K5s", "K4s",
    "QJs", "QTs", "Q9s", "Q8s", "Q7s", "Q6s",
    "JTs", "J9s", "J8s", "J7s",
    "T9s", "T8s", "T7s",
    "98s", "97s", "87s", "86s", "76s", "75s", "65s", "64s", "54s", "53s",
    "AKo", "AQo", "AJo", "ATo", "A9o", "A8o", "A7o", "A6o", "A5o", "A4o",
    "KQo", "KJo", "KTo", "K9o",
    "QJo", "QTo", "Q9o",
    "JTo", "J9o", "T9o"
  ],
  mixedRaise: {
    "K3s": 70, "K2s": 60, "Q5s": 75, "Q4s": 60, "J6s": 50, "96s": 65, "43s": 60,
    "A3o": 65, "A2o": 50, "K8o": 55, "J8o": 40, "98o": 65
  }
});

const btnVsCoMap = buildRangeMap({
  pureRaise: [
    "AA", "KK", "QQ", "JJ", "AKs", "AQs", "AJs", "KQs", "AKo", "AQo"
  ],
  pureCall: [
    "99", "88", "77", "66",
    "QTs", "JTs", "T9s"
  ],
  mixedCall: {
    "TT": { raise: 55, call: 45 },
    "55": { raise: 0, call: 75 },
    "44": { raise: 0, call: 55 },
    "ATs": { raise: 60, call: 40 },
    "A9s": { raise: 45, call: 55 },
    "A8s": { raise: 35, call: 50 },
    "A5s": { raise: 85, call: 15 },
    "A4s": { raise: 80, call: 20 },
    "A3s": { raise: 55, call: 30 },
    "KJs": { raise: 65, call: 35 },
    "KTs": { raise: 45, call: 55 },
    "K9s": { raise: 35, call: 45 },
    "QJs": { raise: 55, call: 45 },
    "Q9s": { raise: 30, call: 40 },
    "J9s": { raise: 25, call: 55 },
    "98s": { raise: 30, call: 60 },
    "87s": { raise: 35, call: 55 },
    "76s": { raise: 35, call: 50 },
    "65s": { raise: 40, call: 40 },
    "54s": { raise: 45, call: 25 },
    "AJo": { raise: 75, call: 15 },
    "ATo": { raise: 55, call: 0 },
    "KQo": { raise: 70, call: 20 },
    "KJo": { raise: 40, call: 0 },
  }
});

const bbVsBtnMap = buildRangeMap({
  pureRaise: [
    "AA", "KK", "QQ", "JJ", "TT",
    "AKs", "AQs", "AJs", "KQs", "AKo", "AQo"
  ],
  pureCall: [
    "88", "77", "66", "55", "44", "33", "22",
    "A9s", "A8s", "A7s", "A6s", "A3s", "A2s",
    "KTs", "K9s", "K8s", "K7s", "K6s", "K5s", "K4s", "K3s", "K2s",
    "QTs", "Q9s", "Q8s", "Q7s", "Q6s",
    "J9s", "J8s", "J7s", "T8s", "T7s", "97s", "86s", "75s", "64s",
    "A9o", "A8o", "A7o", "A6o", "A5o", "A4o",
    "KJo", "KTo", "K9o", "QJo", "QTo", "Q9o", "JTo", "J9o", "T9o"
  ],
  mixedCall: {
    "99": { raise: 65, call: 35 },
    "ATs": { raise: 70, call: 30 },
    "A5s": { raise: 80, call: 20 },
    "A4s": { raise: 75, call: 25 },
    "KJs": { raise: 75, call: 25 },
    "QJs": { raise: 70, call: 30 },
    "JTs": { raise: 65, call: 35 },
    "T9s": { raise: 60, call: 40 },
    "98s": { raise: 55, call: 45 },
    "87s": { raise: 55, call: 45 },
    "76s": { raise: 50, call: 50 },
    "65s": { raise: 50, call: 50 },
    "54s": { raise: 45, call: 55 },
    "Q5s": { raise: 25, call: 75 },
    "Q4s": { raise: 20, call: 80 },
    "Q3s": { raise: 0, call: 75 },
    "J6s": { raise: 20, call: 70 },
    "T6s": { raise: 15, call: 70 },
    "96s": { raise: 15, call: 75 },
    "53s": { raise: 20, call: 80 },
    "43s": { raise: 15, call: 75 },
    "AJo": { raise: 75, call: 25 },
    "ATo": { raise: 55, call: 45 },
    "KQo": { raise: 75, call: 25 },
    "A3o": { raise: 0, call: 65 },
    "K8o": { raise: 20, call: 55 },
    "98o": { raise: 0, call: 70 },
    "87o": { raise: 0, call: 55 }
  }
});

const sbVsBtnMap = buildRangeMap({
  pureRaise: [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88",
    "AKs", "AQs", "AJs", "ATs", "A9s", "A5s", "A4s",
    "KQs", "KJs", "KTs", "QJs", "QTs", "JTs",
    "AKo", "AQo", "AJo", "KQo"
  ],
  mixedRaise: {
    "77": 85, "66": 75, "55": 60,
    "A8s": 80, "A7s": 70, "A6s": 65, "A3s": 75, "A2s": 60,
    "K9s": 80, "Q9s": 75, "J9s": 75, "T9s": 85,
    "98s": 75, "87s": 70, "76s": 65, "65s": 65, "54s": 55,
    "ATo": 80, "KJo": 75, "QJo": 55, "KTo": 45
  }
});

const btnVsBb3BetMap = buildRangeMap({
  pureRaise: [
    // 4-Bet
    "AA", "KK", "QQ", "AKs", "AKo"
  ],
  pureCall: [
    // Call IP vs BB 3-Bet
    "TT", "99", "88", "77", "66",
    "AQs", "AJs", "ATs", "A9s", "A8s",
    "KQs", "KJs", "KTs", "QJs", "QTs", "JTs", "T9s", "98s", "87s", "76s"
  ],
  mixedCall: {
    "JJ": { raise: 55, call: 45 },
    "55": { raise: 0, call: 75 },
    "44": { raise: 0, call: 55 },
    "A5s": { raise: 75, call: 25 },
    "A4s": { raise: 70, call: 30 },
    "A3s": { raise: 45, call: 35 },
    "A7s": { raise: 20, call: 65 },
    "K9s": { raise: 25, call: 60 },
    "Q9s": { raise: 20, call: 55 },
    "J9s": { raise: 15, call: 65 },
    "65s": { raise: 30, call: 60 },
    "54s": { raise: 35, call: 50 },
    "AQo": { raise: 45, call: 55 },
    "AJo": { raise: 35, call: 30 },
    "ATo": { raise: 30, call: 0 },
    "KQo": { raise: 40, call: 45 },
    "KJo": { raise: 25, call: 0 }
  }
});

export const PREFLOP_SCENARIOS: PreflopScenario[] = [
  {
    id: "UTG_RFI",
    category: "RFI",
    title: "UTG (LJ) Open Raise - 100bb Cash 6-Max",
    shortTitle: "UTG Open (RFI)",
    heroPos: "UTG",
    sizing: "2.5 bb",
    potType: "Single Raised Pot (RFI)",
    gtoSummary: computeSummary(utgRfiMap),
    coachNotes: [
      "Desde UTG quedan 5 jugadores por hablar (incluyendo BTN con posición y ciegas con descuento). Tu rango debe ser compacto y centrado en cartas altas suited y pares medios-altos.",
      "Los ases suited bajos (A5s-A2s) son mejores que A7o-A9o porque bloquean AA/AK y tienen jugabilidad postflop (nut flush draws + wheel draws).",
      "Evita abrir offsuit dominados como KTo, QJo o A9o desde UTG: sufren mucho contra 3-bets de MP/CO/BTN."
    ],
    keyAdjustments: [
      "Si la mesa es muy pasiva (poco 3-bet en MP/CO/BTN), puedes expandir con 55-22 y conectores suited (87s-54s) al 100%.",
      "Si hay 3-bettors agresivos en BTN/SB, mantén el tamaño en 2.2bb - 2.5bb y foldea las manos offsuit marginales."
    ],
    frequencies: utgRfiMap,
    pt4HeroFrequencies: buildHeroDeviation(utgRfiMap, "RFI"),
  },
  {
    id: "MP_RFI",
    category: "RFI",
    title: "MP (HJ) Open Raise - 100bb Cash 6-Max",
    shortTitle: "MP Open (RFI)",
    heroPos: "MP",
    sizing: "2.5 bb",
    potType: "Single Raised Pot (RFI)",
    gtoSummary: computeSummary(mpRfiMap),
    coachNotes: [
      "En Hijack (MP) ya abrimos todos los Ases suited (A2s+) al 100% y ampliamos la zona de broadways offsuit (ATo, KJo).",
      "Los conectores suited medios (98s, 87s, 76s, 65s) entran con alta frecuencia para dar cobertura en todo tipo de boards bajos y medios.",
      "Los pares pequeños (44-22) se abren de forma mixta; en mesas con alto rake en microlímites es mejor foldearlos o abrirlos solo si BB defiende de menos."
    ],
    keyAdjustments: [
      "Contra recreacionales en las ciegas, abre todos los pares (22+) y K9s/Q9s/J9s al 100% para cobrar valor por implícitas.",
      "Contra regulares agresivos en CO/BTN, prioriza manos con bloqueadores (Ax suited, Kx suited) sobre pares pequeños."
    ],
    frequencies: mpRfiMap,
    pt4HeroFrequencies: buildHeroDeviation(mpRfiMap, "RFI"),
  },
  {
    id: "CO_RFI",
    category: "RFI",
    title: "CO (Cutoff) Open Raise - 100bb Cash 6-Max",
    shortTitle: "CO Open (RFI)",
    heroPos: "CO",
    sizing: "2.5 bb",
    potType: "Single Raised Pot (RFI)",
    gtoSummary: computeSummary(coRfiMap),
    coachNotes: [
      "El Cutoff roba casi el 30% de la baraja. Solo el BTN tiene posición sobre ti.",
      "Todas las broadways offsuit (hasta JTo) y prácticamente todos los conectores suited (54s+) y un-gap suited (97s, J8s, Q8s) son aperturas rentables.",
      "Tu defensa contra el 3-bet del BTN dependerá de no abrir basura offsuit de más."
    ],
    keyAdjustments: [
      "Si el BTN tiene un 3-Bet < 7%, puedes abrir en CO como si fueras casi el BTN (~35%).",
      "Si el BTN tiene un 3-Bet > 12%, ajusta eliminando la parte baja offsuit (A8o, K9o, QTo) y prepárate para 4-betear más con A5s/A4s/K9s."
    ],
    frequencies: coRfiMap,
    pt4HeroFrequencies: buildHeroDeviation(coRfiMap, "RFI"),
  },
  {
    id: "BTN_RFI",
    category: "RFI",
    title: "BTN (Button) Open Raise - 100bb Cash 6-Max",
    shortTitle: "BTN Open (RFI)",
    heroPos: "BTN",
    sizing: "2.5 bb",
    potType: "Single Raised Pot (RFI)",
    gtoSummary: computeSummary(btnRfiMap),
    coachNotes: [
      "El Button es la posición más rentable del póker: siempre hablarás último postflop en las tres calles.",
      "En GTO se abre ~46% de las manos: todos los pares (22+), todos los Ax suited, todos los Kx suited, todos los Ax offsuit (A3o+ puros, A2o mixto) y gran cantidad de conectores.",
      "Uno de los leaks más comunes en PT4 es tener un RFI en BTN menor al 40%: estás dejando escapar ciegas gratis constantemente."
    ],
    keyAdjustments: [
      "Si SB y BB tienen un Fold to Steal combinado > 65%, sube tu RFI en BTN al 52-55% usando sizing de 2.2bb - 2.5bb.",
      "Si BB 3-betea mucho (>13%), mantén tu frecuencia de robo pero incorpora calls en posición y 4-bets ligeros con bloqueadores (Ax/Kx suited)."
    ],
    frequencies: btnRfiMap,
    pt4HeroFrequencies: buildHeroDeviation(btnRfiMap, "RFI"),
  },
  {
    id: "SB_RFI",
    category: "RFI",
    title: "SB Open Raise vs BB - 100bb Cash 6-Max",
    shortTitle: "SB Open (RFI)",
    heroPos: "SB",
    villainPos: "BB",
    sizing: "3.0 bb",
    potType: "Blind vs Blind (BvB)",
    gtoSummary: computeSummary(sbRfiMap),
    coachNotes: [
      "En guerra de ciegas (SB vs BB) solo queda 1 jugador por hablar, pero estarás fuera de posición (OOP) todo el postflop.",
      "Por eso usamos un tamaño mayor (3.0bb) para negar equidad a la BB y reducir el SPR postflop.",
      "Debes abrir un ~42% de manos en estrategia de 'Solo Raise o Fold'. No regales walks a una BB que foldea más del 55%."
    ],
    keyAdjustments: [
      "En tu base de datos de PT4, revisa el stat 'Fold to SB Steal' del rival en BB: si es > 60%, abre prácticamente cualquier dos cartas con un mínimo de conectividad.",
      "Postflop en BvB, recuerda que los rangos son muy amplios: protege tu rango de Check en flops bajos/medios con algunos pares altos."
    ],
    frequencies: sbRfiMap,
    pt4HeroFrequencies: buildHeroDeviation(sbRfiMap, "RFI"),
  },
  {
    id: "BTN_VS_CO",
    category: "VS_OPEN",
    title: "BTN vs CO Open (3-Bet / Call / Fold)",
    shortTitle: "BTN vs CO Open",
    heroPos: "BTN",
    villainPos: "CO",
    sizing: "3-Bet a 7.5 bb",
    potType: "Vs Open IP",
    gtoSummary: computeSummary(btnVsCoMap),
    coachNotes: [
      "En BTN contra apertura de CO tienes ventaja posicional absoluta. Tu rango se divide entre 3-Bet a 7.5bb (~11.5%) y Call en posición (~10%).",
      "A diferencia de SB/BB, en BTN sí podemos hacer algo de Call con pares medios (99-66) y suited broadways/conectores (QTs, JTs, T9s) porque realizamos muy bien nuestra equidad IP.",
      "Tus 3-bets de farol/semifarol se construyen con A5s-A3s, K9s, Q9s y frecuencias mixtas de 87s-54s y ATo/KJo."
    ],
    keyAdjustments: [
      "Si el juego tiene alto rake (NL10-NL50), reduce los Calls al mínimo y adopta una estrategia más agresiva de 3-Bet o Fold (No Rake preflop).",
      "Si el CO foldea > 60% al 3-bet, incrementa tus 3-bets con todos los Ax offsuit (ATo, AJo) y Kxo (KJo, KQo)."
    ],
    frequencies: btnVsCoMap,
    pt4HeroFrequencies: buildHeroDeviation(btnVsCoMap, "VS_OPEN_IP"),
  },
  {
    id: "SB_VS_BTN",
    category: "VS_OPEN",
    title: "SB vs BTN Open (3-Bet o Fold Strategy)",
    shortTitle: "SB vs BTN Open",
    heroPos: "SB",
    villainPos: "BTN",
    sizing: "3-Bet a 11.0 bb",
    potType: "Vs Open OOP (3-Bet or Fold)",
    gtoSummary: computeSummary(sbVsBtnMap),
    coachNotes: [
      "En Cash Games con rake moderno, la Small Blind juega '3-Bet o Fold' (0% Call) contra aperturas del BTN.",
      "Hacer Call en SB es un leak grave: pagas rake, juegas OOP sin iniciativa y dejas que la BB haga squeeze con precio perfecto.",
      "Tu rango de 3-Bet es lineal y amplio (~15-16%): 88+, ATs+, KTs+, QTs+, JTs, T9s, A5s-A4s, AJo+, KQo y frecuencias de conectores suited."
    ],
    keyAdjustments: [
      "Revisa en nuestro Analizador de Leaks tu 'SB Cold Call %': debería estar por debajo del 2%. Toda mano lo bastante buena para jugarse en SB merece un 3-bet.",
      "Usa un tamaño de 10.5bb - 11.5bb frente al open de 2.5bb del BTN."
    ],
    frequencies: sbVsBtnMap,
    pt4HeroFrequencies: buildHeroDeviation(sbVsBtnMap, "VS_OPEN_IP"),
  },
  {
    id: "BB_VS_BTN",
    category: "VS_OPEN",
    title: "BB Defensa vs BTN Open (3-Bet / Call / Fold)",
    shortTitle: "BB vs BTN Open",
    heroPos: "BB",
    villainPos: "BTN",
    sizing: "3-Bet a 11.0 bb / Call",
    potType: "BB Defense vs Steal",
    gtoSummary: computeSummary(bbVsBtnMap),
    coachNotes: [
      "La Gran Ciega cierra la acción y tiene excelentes pot odds contra un robo a 2.5bb del BTN: debes defender alrededor del 47% de las manos (~13.5% 3-Bet y ~33.5% Call).",
      "El 3-Bet de la BB combina manos de valor fuerte (TT+, AQs+, AKo, KQs) con bluffs polarizados y conectores suited (A5s-A4s, T9s-54s, Q5s, J6s) para tener cobertura en todo tipo de flops.",
      "La mayoría de jugadores en PT4 foldean > 62% en BB vs BTN y solo 3-betean el 7-8%, permitiendo que el BTN imprima dinero."
    ],
    keyAdjustments: [
      "Si el BTN abre a 2.0bb (min-raise), debes defender aún más amplio (~55% de manos), especialmente todas las manos suited.",
      "Si el BTN abre a 3.0bb, ajusta foldeando los offsuit débiles (A3o, K8o, 98o) y las manos suited más desconectadas."
    ],
    frequencies: bbVsBtnMap,
    pt4HeroFrequencies: buildHeroDeviation(bbVsBtnMap, "VS_OPEN_BB"),
  },
  {
    id: "BTN_VS_BB_3BET",
    category: "VS_3BET",
    title: "BTN vs BB 3-Bet (4-Bet / Call / Fold IP)",
    shortTitle: "BTN vs BB 3-Bet",
    heroPos: "BTN",
    villainPos: "BB",
    sizing: "4-Bet a 23.5 bb / Call",
    potType: "3-Bet Pot IP",
    gtoSummary: computeSummary(btnVsBb3BetMap),
    coachNotes: [
      "Cuando abres en BTN (2.5bb) y la BB te hace 3-Bet a 11bb, tienes posición todo el postflop y necesitas defender ~57% de tu rango de apertura.",
      "Tu rango de 4-Bet (~11%) usa un tamaño pequeño en posición (22-24bb) y mezcla AA, KK, QQ, AK con bluffs que bloquean continuaciones (A5s, A4s, AJo, ATo, KQo, K9s).",
      "Tus Calls en posición (~46% del rango de open) incluyen pares 66-JJ, broadways suited (AQs-A8s, KQs-KTs, QJs-QTs, JTs) y conectores suited (T9s-65s)."
    ],
    keyAdjustments: [
      "Contra rivales en BB con 3-Bet < 6% (muy tight/nits), foldea tranquilamente 77-55, A9s, KTs y evita hacer 4-bet bluff: su rango es puramente JJ+, AK.",
      "Contra regulares agresivos (BB 3-Bet > 12%), no sobre-foldees: paga en posición con tus manos suited y presiona sus checks en flop/turn."
    ],
    frequencies: btnVsBb3BetMap,
    pt4HeroFrequencies: buildHeroDeviation(btnVsBb3BetMap, "VS_3BET"),
  }
];
