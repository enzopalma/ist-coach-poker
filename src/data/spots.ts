import {
  PREFLOP_SCENARIOS,
  PreflopScenario,
  HandFrequencies,
  Position,
  RANKS,
  getAll169Hands,
  getHandCombos,
  computeSummary,
  buildHeroDeviation,
} from "./pokerRanges";

/**
 * Registro único de spots preflop para consulta rápida.
 * - Spots escritos a mano en pokerRanges.ts (aproximaciones).
 * - Spots generados con un modelo simple (Chen + porcentajes típicos): REFERENCIA APROXIMADA.
 * - Cualquier spot puede ser reemplazado con un rango importado (guardado en el navegador).
 */

export const POSITIONS: Position[] = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
const ORDER: Record<Position, number> = { UTG: 0, MP: 1, CO: 2, BTN: 3, SB: 4, BB: 5 };

export type Frequencies = Record<string, HandFrequencies>;

// ---------- Ranking de manos (fórmula de Chen) ----------
function chenScore(hand: string): number {
  const val = (c: string) => {
    if (c === "A") return 10;
    if (c === "K") return 8;
    if (c === "Q") return 7;
    if (c === "J") return 6;
    return c === "T" ? 5 : Number(c) / 2;
  };
  const idx = (c: string) => RANKS.indexOf(c as (typeof RANKS)[number]);
  const a = hand[0];
  const b = hand[1];
  const isPair = a === b;
  const suited = hand.endsWith("s");
  if (isPair) return Math.max(val(a) * 2, 5);
  let s = val(a);
  if (suited) s += 2;
  const gap = idx(b) - idx(a) - 1;
  if (gap === 1) s -= 1;
  else if (gap === 2) s -= 2;
  else if (gap === 3) s -= 4;
  else if (gap >= 4) s -= 5;
  if (gap <= 1 && idx(a) > 2) s += 1; // conectadas por debajo de la Q
  return s;
}

const HANDS_BY_STRENGTH: string[] = getAll169Hands()
  .filter((h, i, arr) => arr.indexOf(h) === i)
  .sort((x, y) => chenScore(y) - chenScore(x) || x.localeCompare(y));

const BLUFFS_ORDER = [
  "A5s", "A4s", "A3s", "A2s", "K9s", "Q9s", "J9s", "T9s", "98s", "87s", "76s", "65s", "54s", "K8s", "A9o", "KTo",
];

type Budget = { list: string[]; pct: number };

function fillRange(budget: Budget, taken: Set<string>): Record<string, number> {
  const result: Record<string, number> = {};
  let remaining = (budget.pct / 100) * 1326;
  for (const h of budget.list) {
    if (remaining <= 0.01) break;
    if (taken.has(h)) continue;
    const combos = getHandCombos(h);
    if (remaining >= combos) {
      result[h] = 100;
      remaining -= combos;
    } else {
      result[h] = Math.max(5, Math.round((remaining / combos) * 100 / 5) * 5);
      remaining = 0;
    }
  }
  return result;
}

function buildFromBudgets(
  raisePct: number,
  callPct: number,
  candidates?: Set<string>
): Frequencies {
  const inCand = (h: string) => !candidates || candidates.has(h);
  const strength = HANDS_BY_STRENGTH.filter(inCand);
  const bluffs = BLUFFS_ORDER.filter(inCand);

  const valuePct = raisePct * 0.65;
  const bluffPct = raisePct - valuePct;
  const taken = new Set<string>();

  const value = fillRange({ list: strength, pct: valuePct }, taken);
  Object.keys(value).forEach((h) => taken.add(h));
  const bluff = fillRange({ list: bluffs, pct: bluffPct }, taken);
  Object.keys(bluff).forEach((h) => taken.add(h));

  const callable = strength.filter((h) => {
    if (h.length === 2 || h.endsWith("s")) return true;
    return chenScore(h) >= 8; // offsuit sólo si es razonablemente fuerte
  });
  const call = fillRange({ list: callable, pct: callPct }, taken);

  const map: Frequencies = {};
  for (const h of getAll169Hands()) map[h] = { raise: 0, call: 0, fold: 100 };
  for (const [h, f] of Object.entries({ ...value, ...bluff })) {
    map[h] = { raise: f, call: 0, fold: 100 - f };
  }
  for (const [h, f] of Object.entries(call)) {
    const r = map[h].raise;
    const c = Math.min(f, 100 - r);
    map[h] = { raise: r, call: c, fold: 100 - r - c };
  }
  return map;
}

// ---------- Parámetros aproximados 6-max 100bb ----------
// [3bet%, call%] del héroe contra la apertura de cada posición
const VS_OPEN_PARAMS: Record<string, [number, number]> = {
  "MP|UTG": [3.5, 1.5],
  "CO|UTG": [4.5, 3],
  "BTN|UTG": [6, 7],
  "SB|UTG": [6.5, 0],
  "BB|UTG": [7, 16],
  "CO|MP": [5, 3.5],
  "BTN|MP": [7, 8.5],
  "SB|MP": [7.5, 0],
  "BB|MP": [8, 19],
  "SB|CO": [10.5, 0],
  "BB|CO": [10, 24],
  "BB|SB": [13, 36],
};

const OPEN_WIDTH: Record<string, number> = { UTG: 16.5, MP: 21, CO: 28, BTN: 46, SB: 42 };
const VILLAIN_3BET_FACTOR: Record<string, number> = { MP: 0.8, CO: 0.85, BTN: 0.95, SB: 1, BB: 1 };

function isHeroInPosition(hero: Position, villain: Position): boolean {
  if (hero === "SB" || hero === "BB") return false;
  if (villain === "SB" || villain === "BB") return true;
  return ORDER[hero] > ORDER[villain];
}

const GENERATED_NOTE =
  "Rango de referencia aproximado generado por el modelo de la app (no es un solver). Reemplázalo con tu propio rango usando «Importar rango».";

function baseSpot(
  p: Pick<PreflopScenario, "id" | "category" | "heroPos" | "villainPos" | "sizing" | "potType">,
  freqs: Frequencies,
  deviationMode: "RFI" | "VS_OPEN_IP" | "VS_OPEN_BB" | "VS_3BET"
): PreflopScenario {
  return {
    ...p,
    title: "",
    shortTitle: "",
    gtoSummary: computeSummary(freqs),
    coachNotes: [GENERATED_NOTE],
    keyAdjustments: [],
    frequencies: freqs,
    pt4HeroFrequencies: buildHeroDeviation(freqs, deviationMode),
  };
}

function rfiFrequencies(pos: Position): Frequencies | null {
  const s = PREFLOP_SCENARIOS.find((x) => x.category === "RFI" && x.heroPos === pos);
  return s ? s.frequencies : null;
}

function generateSpots(): PreflopScenario[] {
  const out: PreflopScenario[] = [];

  // Vs Open
  for (const [key, [raise, call]] of Object.entries(VS_OPEN_PARAMS)) {
    const [hero, opener] = key.split("|") as [Position, Position];
    const id = `${hero}_VS_${opener}`;
    const ip = isHeroInPosition(hero, opener);
    const size = ip ? "3-Bet a 7.5 bb" : hero === "BB" && opener === "SB" ? "3-Bet a 10 bb" : "3-Bet a 11 bb";
    out.push(
      baseSpot(
        { id, category: "VS_OPEN", heroPos: hero, villainPos: opener, sizing: size, potType: "Vs Open" },
        buildFromBudgets(raise, call),
        hero === "BB" ? "VS_OPEN_BB" : "VS_OPEN_IP"
      )
    );
  }

  // Vs 3-Bet (héroe abrió, el villano hace 3-bet desde una posición posterior)
  const heroes: Position[] = ["UTG", "MP", "CO", "BTN", "SB"];
  for (const hero of heroes) {
    const rfi = rfiFrequencies(hero);
    if (!rfi) continue;
    const candidates = new Set(Object.keys(rfi).filter((h) => rfi[h].raise > 0));
    for (const villain of POSITIONS.filter((p) => ORDER[p] > ORDER[hero])) {
      const ip = isHeroInPosition(hero, villain);
      const width = OPEN_WIDTH[hero];
      const cont = width * (ip ? 0.55 : 0.45) * (VILLAIN_3BET_FACTOR[villain] ?? 1);
      const fourBet = cont * 0.2;
      const call = cont - fourBet;
      out.push(
        baseSpot(
          {
            id: `${hero}_VS_${villain}_3BET`,
            category: "VS_3BET",
            heroPos: hero,
            villainPos: villain,
            sizing: ip ? "4-Bet a 22 bb" : "4-Bet a 25 bb",
            potType: "3-Bet Pot",
          },
          buildFromBudgets(fourBet, call, candidates),
          "VS_3BET"
        )
      );
    }
  }
  return out;
}

function normalizeTitles(spot: PreflopScenario): PreflopScenario {
  if (spot.category === "RFI") {
    return { ...spot, title: `${spot.heroPos} Open Raise`, shortTitle: "Open", villainPos: undefined };
  }
  if (spot.category === "VS_OPEN") {
    return {
      ...spot,
      title: `${spot.heroPos} vs ${spot.villainPos} Open`,
      shortTitle: `vs ${spot.villainPos} open`,
    };
  }
  return {
    ...spot,
    title: `${spot.heroPos} vs ${spot.villainPos} 3-Bet`,
    shortTitle: `vs ${spot.villainPos} 3bet`,
  };
}

function buildAllSpots(): PreflopScenario[] {
  const manual = PREFLOP_SCENARIOS;
  const keyOf = (s: PreflopScenario) => `${s.category}|${s.heroPos}|${s.category === "RFI" ? "" : s.villainPos}`;
  const known = new Set(manual.map(keyOf));
  const generated = generateSpots().filter((s) => !known.has(keyOf(s)));
  const rank = (s: PreflopScenario) =>
    (s.category === "RFI" ? 0 : s.category === "VS_OPEN" ? 1 : 2) * 100 +
    ORDER[s.heroPos] * 10 +
    (s.villainPos ? ORDER[s.villainPos] : 0);
  return [...manual, ...generated].map(normalizeTitles).sort((a, b) => rank(a) - rank(b));
}

export const ALL_SPOTS: PreflopScenario[] = buildAllSpots();

// ---------- Importador de rangos ----------
export interface RangeOverride {
  raise: string;
  call: string;
}

const RANK_IDX = (c: string) => RANKS.indexOf(c as (typeof RANKS)[number]);
const TOKEN_RE = /^([AKQJT2-9]{2})([so]?)(\+|-([AKQJT2-9]{2})([so]?))?(?::(\d*\.?\d+))?$/i;

function expandToken(token: string): { hands: string[]; weight: number } | null {
  const m = token.trim().match(TOKEN_RE);
  if (!m) return null;
  const base = m[1].toUpperCase();
  const suffix = (m[2] || "").toLowerCase();
  const rangeKind = m[3] ? (m[3] === "+" ? "plus" : "dash") : "";
  const dashEnd = m[4] ? m[4].toUpperCase() : "";
  let weight = m[6] !== undefined ? Number(m[6]) : 1;
  if (weight > 1) weight = weight / 100;
  weight = Math.max(0, Math.min(1, weight));

  const a = base[0];
  const b = base[1];
  const hands: string[] = [];

  if (a === b) {
    // Pares
    const start = RANK_IDX(a);
    if (rangeKind === "plus") {
      for (let i = start; i >= 0; i--) hands.push(RANKS[i] + RANKS[i]);
    } else if (rangeKind === "dash" && dashEnd[0] === dashEnd[1]) {
      const end = RANK_IDX(dashEnd[0]);
      const [lo, hi] = [Math.min(start, end), Math.max(start, end)];
      for (let i = lo; i <= hi; i++) hands.push(RANKS[i] + RANKS[i]);
    } else {
      hands.push(a + b);
    }
    return { hands, weight };
  }

  // No pares: normalizar para que la primera sea la carta más alta
  const hi = RANK_IDX(a) < RANK_IDX(b) ? a : b;
  const lo = hi === a ? b : a;
  const kinds = suffix ? [suffix] : ["s", "o"];
  const pushSecond = (second: string) => {
    for (const k of kinds) hands.push(hi + second + k);
  };

  if (rangeKind === "plus") {
    for (let i = RANK_IDX(lo); i > RANK_IDX(hi); i--) pushSecond(RANKS[i]);
  } else if (rangeKind === "dash" && dashEnd) {
    const end = RANK_IDX(dashEnd[0] === hi ? dashEnd[1] : dashEnd[1]);
    const [from, to] = [Math.min(RANK_IDX(lo), end), Math.max(RANK_IDX(lo), end)];
    for (let i = from; i <= to; i++) if (i > RANK_IDX(hi)) pushSecond(RANKS[i]);
  } else {
    pushSecond(lo);
  }
  return { hands, weight };
}

export function parseRange(text: string): { map: Record<string, number>; errors: string[] } {
  const map: Record<string, number> = {};
  const errors: string[] = [];
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  for (const t of tokens) {
    const res = expandToken(t);
    if (!res) {
      errors.push(t);
      continue;
    }
    for (const h of res.hands) {
      if (RANKS.includes(h[0] as (typeof RANKS)[number])) map[h] = Math.round(res.weight * 100);
    }
  }
  return { map, errors };
}

export function applyOverride(spot: PreflopScenario, ov: RangeOverride): PreflopScenario {
  const raise = parseRange(ov.raise).map;
  const call = parseRange(ov.call).map;
  const freqs: Frequencies = {};
  for (const h of getAll169Hands()) {
    let r = raise[h] ?? 0;
    let c = call[h] ?? 0;
    if (r + c > 100) {
      const k = 100 / (r + c);
      r = Math.round(r * k);
      c = 100 - r;
    }
    freqs[h] = { raise: r, call: c, fold: 100 - r - c };
  }
  const mode =
    spot.category === "RFI" ? "RFI" : spot.category === "VS_3BET" ? "VS_3BET" : spot.heroPos === "BB" ? "VS_OPEN_BB" : "VS_OPEN_IP";
  return {
    ...spot,
    gtoSummary: computeSummary(freqs),
    coachNotes: ["Rango importado por ti (guardado en este navegador)."],
    keyAdjustments: [],
    frequencies: freqs,
    pt4HeroFrequencies: buildHeroDeviation(freqs, mode),
  };
}

/** Convierte las frecuencias actuales a texto, para precargar el editor. */
export function rangeToText(freqs: Frequencies, kind: "raise" | "call"): string {
  return getAll169Hands()
    .filter((h, i, arr) => arr.indexOf(h) === i && freqs[h] && freqs[h][kind] > 0)
    .map((h) => (freqs[h][kind] >= 100 ? h : `${h}:${freqs[h][kind]}`))
    .join(",");
}

export const OVERRIDES_KEY = "ist-coach-ranges-v1";
