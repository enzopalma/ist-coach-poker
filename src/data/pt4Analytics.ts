import { Position } from "./pokerRanges";

export interface PositionStats {
  position: Position;
  hands: number;
  vpip: number;
  pfr: number;
  rfi: number;
  threeBet: number;
  foldTo3Bet: number;
  coldCall: number;
  cbetFlop: number;
  cbetTurn: number;
  wtsd: number;
  wsd: number;
  wwsf: number;
  bb100: number;
  evBb100: number;
}

export interface Pt4DatabaseSummary {
  source: "DEMO" | "POSTGRES_LIVE" | "CSV_IMPORT";
  playerName: string;
  databaseName: string;
  stakeLabel: string;
  totalHands: number;
  netWonUsd: number;
  bb100: number;
  evBb100: number;
  globalVpip: number;
  globalPfr: number;
  global3Bet: number;
  globalFoldTo3Bet: number;
  globalCbetFlop: number;
  globalCbetTurn: number;
  globalWtsd: number;
  globalWsd: number;
  globalWwsf: number;
  positions: Record<Position, PositionStats>;
}

export interface GtoPositionTarget {
  position: Position;
  vpipRange: [number, number];
  pfrRange: [number, number];
  rfiTarget: number;
  threeBetRange: [number, number];
  foldTo3BetRange: [number, number];
  coldCallMax: number;
  cbetFlopTarget: number;
  targetBb100: number;
}

export type LeakEvolutionStatus =
  | "RESOLVED" // Corregido en la muestra reciente
  | "IMPROVING" // En progreso de mejora
  | "PERSISTENT" // Sigue activo en la muestra
  | "MAINTAINED"; // Disciplina o punto fuerte sostenido

export interface DetectedLeak {
  id: string;
  title: string;
  position: Position | "GLOBAL";
  severity: "CRITICAL" | "MODERATE" | "OPTIMAL";
  statName: string;
  heroValue: string;
  baselineValue?: string;
  gtoTarget: string;
  estimatedEvLossBb100: number;
  diagnosis: string;
  actionableFix: string;
  linkedPreflopScenarioId?: string;
  linkedPostflopSpotId?: string;
  evolutionStatus?: LeakEvolutionStatus;
  evolutionNote?: string;
}

// Filtros estándar de PokerTracker 4
export type SampleFilterPreset =
  | "ALL_TIME"
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "LAST_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_YEAR"
  | "LAST_YEAR"
  | "LAST_30_DAYS"
  | "LAST_90_DAYS"
  | "LAST_1K"
  | "LAST_5K"
  | "LAST_10K"
  | "LAST_25K"
  | "LAST_50K"
  | "CUSTOM_DATE";

export interface SampleFilterState {
  preset: SampleFilterPreset;
  customFrom?: string; // YYYY-MM-DD
  customTo?: string; // YYYY-MM-DD
}

export interface PresetFilterMeta {
  id: SampleFilterPreset;
  label: string;
  shortLabel: string;
  category: "QUICK" | "DATE" | "HANDS" | "CUSTOM";
  description: string;
}

export const PT4_FILTER_PRESETS: PresetFilterMeta[] = [
  {
    id: "ALL_TIME",
    label: "Toda la muestra (Lifetime)",
    shortLabel: "Toda la muestra",
    category: "QUICK",
    description: "Todo el historial registrado de manos en la base de datos",
  },
  {
    id: "TODAY",
    label: "Hoy (Sesión del día)",
    shortLabel: "Hoy",
    category: "QUICK",
    description: "Manos jugadas durante el día de hoy",
  },
  {
    id: "YESTERDAY",
    label: "Ayer",
    shortLabel: "Ayer",
    category: "QUICK",
    description: "Manos jugadas durante el día de ayer",
  },
  {
    id: "THIS_WEEK",
    label: "Esta semana",
    shortLabel: "Esta semana",
    category: "QUICK",
    description: "Lunes a domingo de la semana en curso",
  },
  {
    id: "LAST_WEEK",
    label: "Semana anterior",
    shortLabel: "Semana anterior",
    category: "DATE",
    description: "Semana completa anterior (7 días cerrados)",
  },
  {
    id: "THIS_MONTH",
    label: "Este mes",
    shortLabel: "Este mes",
    category: "QUICK",
    description: "Mes en curso actual",
  },
  {
    id: "LAST_MONTH",
    label: "Mes anterior",
    shortLabel: "Mes anterior",
    category: "DATE",
    description: "Mes calendario anterior cerrado",
  },
  {
    id: "THIS_YEAR",
    label: "Este año",
    shortLabel: "Este año",
    category: "DATE",
    description: "Año calendario actual en curso",
  },
  {
    id: "LAST_YEAR",
    label: "Año anterior",
    shortLabel: "Año anterior",
    category: "DATE",
    description: "Año calendario anterior completo",
  },
  {
    id: "LAST_30_DAYS",
    label: "Últimos 30 días",
    shortLabel: "Últimos 30 días",
    category: "QUICK",
    description: "Período móvil de los últimos 30 días",
  },
  {
    id: "LAST_90_DAYS",
    label: "Últimos 90 días",
    shortLabel: "Últimos 90 días",
    category: "DATE",
    description: "Trimestre móvil de juego reciente",
  },
  {
    id: "LAST_1K",
    label: "Últimas 1.000 manos",
    shortLabel: "Últimas 1k",
    category: "HANDS",
    description: "Micro muestra de la sesión más reciente",
  },
  {
    id: "LAST_5K",
    label: "Últimas 5.000 manos",
    shortLabel: "Últimas 5k",
    category: "HANDS",
    description: "Muestra de las últimas 5 a 10 sesiones",
  },
  {
    id: "LAST_10K",
    label: "Últimas 10.000 manos",
    shortLabel: "Últimas 10k",
    category: "QUICK",
    description: "Muestra óptima a corto plazo para evaluar cambios técnicos",
  },
  {
    id: "LAST_25K",
    label: "Últimas 25.000 manos",
    shortLabel: "Últimas 25k",
    category: "HANDS",
    description: "Muestra sólida a medio plazo",
  },
  {
    id: "LAST_50K",
    label: "Últimas 50.000 manos",
    shortLabel: "Últimas 50k",
    category: "HANDS",
    description: "Gran volumen acumulado",
  },
  {
    id: "CUSTOM_DATE",
    label: "Rango personalizado (Desde - Hasta)",
    shortLabel: "Personalizado",
    category: "CUSTOM",
    description: "Filtro manual por fechas 'Desde' y 'Hasta'",
  },
];

export interface SampleComparison {
  isFiltered: boolean;
  filterLabel: string;
  filterDescription: string;
  handsRatioPct: number;
  deltaHands: number;
  deltaBb100: number;
  deltaEvBb100: number;
  deltaNetWonUsd: number;
  deltaVpip: number;
  deltaPfr: number;
  delta3Bet: number;
  deltaFoldTo3Bet: number;
  deltaCbetFlop: number;
  deltaCbetTurn: number;
  deltaWwsf: number;
  trendText: string;
  isImproving: boolean;
}

export const GTO_6MAX_TARGETS: Record<Position, GtoPositionTarget> = {
  UTG: {
    position: "UTG",
    vpipRange: [15.5, 18.5],
    pfrRange: [15.0, 18.0],
    rfiTarget: 16.5,
    threeBetRange: [0, 0],
    foldTo3BetRange: [52, 60],
    coldCallMax: 0,
    cbetFlopTarget: 62,
    targetBb100: 14.5,
  },
  MP: {
    position: "MP",
    vpipRange: [19.5, 23.0],
    pfrRange: [19.0, 22.5],
    rfiTarget: 21.5,
    threeBetRange: [5.5, 7.5],
    foldTo3BetRange: [52, 60],
    coldCallMax: 1.5,
    cbetFlopTarget: 64,
    targetBb100: 18.0,
  },
  CO: {
    position: "CO",
    vpipRange: [26.0, 31.0],
    pfrRange: [25.0, 30.0],
    rfiTarget: 29.5,
    threeBetRange: [8.0, 10.5],
    foldTo3BetRange: [50, 58],
    coldCallMax: 3.0,
    cbetFlopTarget: 68,
    targetBb100: 24.5,
  },
  BTN: {
    position: "BTN",
    vpipRange: [41.0, 48.0],
    pfrRange: [35.0, 43.0],
    rfiTarget: 46.5,
    threeBetRange: [10.5, 13.5],
    foldTo3BetRange: [42, 50],
    coldCallMax: 8.5,
    cbetFlopTarget: 72,
    targetBb100: 36.0,
  },
  SB: {
    position: "SB",
    vpipRange: [26.0, 33.0],
    pfrRange: [25.0, 32.0],
    rfiTarget: 42.0,
    threeBetRange: [11.5, 15.5],
    foldTo3BetRange: [48, 56],
    coldCallMax: 2.0,
    cbetFlopTarget: 54,
    targetBb100: -14.0,
  },
  BB: {
    position: "BB",
    vpipRange: [34.0, 42.0],
    pfrRange: [10.0, 14.5],
    rfiTarget: 0,
    threeBetRange: [10.5, 14.5],
    foldTo3BetRange: [45, 55],
    coldCallMax: 28.0,
    cbetFlopTarget: 58,
    targetBb100: -27.5,
  },
};

// Base de datos histórica completa (62,450 manos con leaks acumulados)
export const DEMO_PT4_DATABASE: Pt4DatabaseSummary = {
  source: "DEMO",
  playerName: "Hero_IST",
  databaseName: "PT4_DB_NL50_6Max (Demo)",
  stakeLabel: "NL50 ($0.25/$0.50) 6-Max",
  totalHands: 62450,
  netWonUsd: 1311.45,
  bb100: 4.2,
  evBb100: 4.8,
  globalVpip: 24.6,
  globalPfr: 19.2,
  global3Bet: 7.8,
  globalFoldTo3Bet: 61.4,
  globalCbetFlop: 74.5,
  globalCbetTurn: 43.2,
  globalWtsd: 27.8,
  globalWsd: 52.4,
  globalWwsf: 44.1,
  positions: {
    UTG: {
      position: "UTG",
      hands: 10120,
      vpip: 16.8,
      pfr: 16.4,
      rfi: 16.4,
      threeBet: 0,
      foldTo3Bet: 62.5,
      coldCall: 0.4,
      cbetFlop: 67.0,
      cbetTurn: 46.0,
      wtsd: 27.1,
      wsd: 54.2,
      wwsf: 46.5,
      bb100: 13.8,
      evBb100: 14.2,
    },
    MP: {
      position: "MP",
      hands: 10340,
      vpip: 20.9,
      pfr: 19.8,
      rfi: 20.8,
      threeBet: 5.4,
      foldTo3Bet: 60.2,
      coldCall: 1.8,
      cbetFlop: 69.5,
      cbetTurn: 45.1,
      wtsd: 27.5,
      wsd: 53.8,
      wwsf: 45.9,
      bb100: 16.9,
      evBb100: 17.4,
    },
    CO: {
      position: "CO",
      hands: 10490,
      vpip: 26.8,
      pfr: 24.1,
      rfi: 27.2,
      threeBet: 7.6,
      foldTo3Bet: 59.8,
      coldCall: 3.9,
      cbetFlop: 73.2,
      cbetTurn: 44.0,
      wtsd: 28.0,
      wsd: 52.9,
      wwsf: 45.2,
      bb100: 21.8,
      evBb100: 22.6,
    },
    BTN: {
      position: "BTN",
      hands: 10580,
      vpip: 39.4,
      pfr: 30.8,
      rfi: 39.2,
      threeBet: 8.9,
      foldTo3Bet: 56.5,
      coldCall: 11.4,
      cbetFlop: 79.8,
      cbetTurn: 41.5,
      wtsd: 28.4,
      wsd: 51.8,
      wwsf: 44.8,
      bb100: 29.4,
      evBb100: 30.5,
    },
    SB: {
      position: "SB",
      hands: 10460,
      vpip: 27.5,
      pfr: 19.6,
      rfi: 34.8,
      threeBet: 8.4,
      foldTo3Bet: 63.0,
      coldCall: 7.9,
      cbetFlop: 74.0,
      cbetTurn: 38.5,
      wtsd: 26.9,
      wsd: 50.4,
      wwsf: 41.2,
      bb100: -21.6,
      evBb100: -20.8,
    },
    BB: {
      position: "BB",
      hands: 10460,
      vpip: 26.2,
      pfr: 6.9,
      rfi: 0,
      threeBet: 6.9,
      foldTo3Bet: 58.0,
      coldCall: 19.3,
      cbetFlop: 62.0,
      cbetTurn: 44.0,
      wtsd: 28.9,
      wsd: 51.3,
      wwsf: 40.9,
      bb100: -35.1,
      evBb100: -34.9,
    },
  },
};

// Sub-muestras realistas que demuestran la evolución del jugador tras estudiar en IST Coach
const DEMO_PRESET_SUMMARIES: Partial<Record<SampleFilterPreset, Pt4DatabaseSummary>> = {
  // HOY: Sesión actual con juego calibrado y leaks corregidos
  TODAY: {
    source: "DEMO",
    playerName: "Hero_IST",
    databaseName: "PT4 Demo · Sesión de Hoy",
    stakeLabel: "NL50 ($0.25/$0.50) 6-Max",
    totalHands: 920,
    netWonUsd: 41.8,
    bb100: 9.1,
    evBb100: 8.7,
    globalVpip: 25.8,
    globalPfr: 22.0,
    global3Bet: 11.2,
    globalFoldTo3Bet: 47.5,
    globalCbetFlop: 63.0,
    globalCbetTurn: 53.5,
    globalWtsd: 27.2,
    globalWsd: 54.8,
    globalWwsf: 49.1,
    positions: {
      UTG: {
        position: "UTG",
        hands: 152,
        vpip: 17.1,
        pfr: 17.1,
        rfi: 17.1,
        threeBet: 0,
        foldTo3Bet: 54.0,
        coldCall: 0,
        cbetFlop: 62.5,
        cbetTurn: 48.0,
        wtsd: 26.5,
        wsd: 55.0,
        wwsf: 47.0,
        bb100: 15.2,
        evBb100: 14.8,
      },
      MP: {
        position: "MP",
        hands: 155,
        vpip: 21.2,
        pfr: 20.6,
        rfi: 21.2,
        threeBet: 6.8,
        foldTo3Bet: 55.0,
        coldCall: 0.8,
        cbetFlop: 63.5,
        cbetTurn: 49.0,
        wtsd: 27.0,
        wsd: 54.0,
        wwsf: 48.0,
        bb100: 18.5,
        evBb100: 18.1,
      },
      CO: {
        position: "CO",
        hands: 158,
        vpip: 28.5,
        pfr: 27.2,
        rfi: 28.5,
        threeBet: 9.5,
        foldTo3Bet: 52.0,
        coldCall: 1.5,
        cbetFlop: 66.0,
        cbetTurn: 51.0,
        wtsd: 27.5,
        wsd: 54.5,
        wwsf: 49.0,
        bb100: 25.4,
        evBb100: 24.8,
      },
      BTN: {
        position: "BTN",
        hands: 155,
        vpip: 44.5,
        pfr: 40.2,
        rfi: 47.1,
        threeBet: 12.8,
        foldTo3Bet: 45.0,
        coldCall: 5.5,
        cbetFlop: 70.0,
        cbetTurn: 48.5,
        wtsd: 28.0,
        wsd: 53.5,
        wwsf: 49.5,
        bb100: 38.2,
        evBb100: 36.5,
      },
      SB: {
        position: "SB",
        hands: 150,
        vpip: 29.5,
        pfr: 28.0,
        rfi: 42.5,
        threeBet: 13.8,
        foldTo3Bet: 50.0,
        coldCall: 0.9,
        cbetFlop: 55.0,
        cbetTurn: 46.0,
        wtsd: 26.5,
        wsd: 53.0,
        wwsf: 47.5,
        bb100: -11.8,
        evBb100: -12.4,
      },
      BB: {
        position: "BB",
        hands: 150,
        vpip: 37.5,
        pfr: 12.5,
        rfi: 0,
        threeBet: 12.5,
        foldTo3Bet: 49.0,
        coldCall: 25.0,
        cbetFlop: 58.0,
        cbetTurn: 48.0,
        wtsd: 28.0,
        wsd: 53.0,
        wwsf: 46.0,
        bb100: -24.5,
        evBb100: -25.2,
      },
    },
  },

  // AYER
  YESTERDAY: {
    source: "DEMO",
    playerName: "Hero_IST",
    databaseName: "PT4 Demo · Sesión de Ayer",
    stakeLabel: "NL50 ($0.25/$0.50) 6-Max",
    totalHands: 1340,
    netWonUsd: 48.2,
    bb100: 7.2,
    evBb100: 7.0,
    globalVpip: 25.2,
    globalPfr: 21.4,
    global3Bet: 10.6,
    globalFoldTo3Bet: 49.0,
    globalCbetFlop: 64.8,
    globalCbetTurn: 51.5,
    globalWtsd: 27.5,
    globalWsd: 53.9,
    globalWwsf: 48.4,
    positions: {
      UTG: { position: "UTG", hands: 220, vpip: 16.9, pfr: 16.8, rfi: 16.8, threeBet: 0, foldTo3Bet: 56.0, coldCall: 0.2, cbetFlop: 63.0, cbetTurn: 47.0, wtsd: 26.8, wsd: 54.5, wwsf: 46.8, bb100: 14.5, evBb100: 14.3 },
      MP: { position: "MP", hands: 225, vpip: 21.0, pfr: 20.2, rfi: 21.0, threeBet: 6.4, foldTo3Bet: 56.0, coldCall: 1.1, cbetFlop: 64.0, cbetTurn: 48.0, wtsd: 27.2, wsd: 53.8, wwsf: 47.5, bb100: 17.8, evBb100: 17.5 },
      CO: { position: "CO", hands: 225, vpip: 27.8, pfr: 26.5, rfi: 28.0, threeBet: 9.0, foldTo3Bet: 53.0, coldCall: 1.8, cbetFlop: 67.0, cbetTurn: 50.0, wtsd: 27.8, wsd: 54.0, wwsf: 48.5, bb100: 24.2, evBb100: 24.0 },
      BTN: { position: "BTN", hands: 230, vpip: 43.8, pfr: 39.5, rfi: 46.2, threeBet: 12.2, foldTo3Bet: 46.0, coldCall: 6.2, cbetFlop: 71.0, cbetTurn: 47.5, wtsd: 28.2, wsd: 53.0, wwsf: 49.0, bb100: 36.5, evBb100: 35.8 },
      SB: { position: "SB", hands: 220, vpip: 28.8, pfr: 27.2, rfi: 41.8, threeBet: 13.0, foldTo3Bet: 51.5, coldCall: 1.2, cbetFlop: 56.0, cbetTurn: 45.0, wtsd: 26.8, wsd: 52.5, wwsf: 47.0, bb100: -12.9, evBb100: -13.2 },
      BB: { position: "BB", hands: 220, vpip: 36.8, pfr: 11.8, rfi: 0, threeBet: 12.0, foldTo3Bet: 50.0, coldCall: 24.8, cbetFlop: 59.0, cbetTurn: 47.0, wtsd: 28.2, wsd: 52.8, wwsf: 45.5, bb100: -25.8, evBb100: -26.0 },
    },
  },

  // ESTA SEMANA: Muestra sólida de mejora
  THIS_WEEK: {
    source: "DEMO",
    playerName: "Hero_IST",
    databaseName: "PT4 Demo · Esta Semana",
    stakeLabel: "NL50 ($0.25/$0.50) 6-Max",
    totalHands: 3650,
    netWonUsd: 149.65,
    bb100: 8.2,
    evBb100: 8.0,
    globalVpip: 25.5,
    globalPfr: 21.8,
    global3Bet: 10.8,
    globalFoldTo3Bet: 48.0,
    globalCbetFlop: 64.2,
    globalCbetTurn: 52.2,
    globalWtsd: 27.4,
    globalWsd: 54.2,
    globalWwsf: 48.8,
    positions: {
      UTG: { position: "UTG", hands: 600, vpip: 17.0, pfr: 16.9, rfi: 16.9, threeBet: 0, foldTo3Bet: 55.0, coldCall: 0.1, cbetFlop: 62.8, cbetTurn: 47.5, wtsd: 26.9, wsd: 54.8, wwsf: 46.9, bb100: 14.8, evBb100: 14.5 },
      MP: { position: "MP", hands: 610, vpip: 21.1, pfr: 20.4, rfi: 21.1, threeBet: 6.6, foldTo3Bet: 55.5, coldCall: 1.0, cbetFlop: 63.8, cbetTurn: 48.5, wtsd: 27.1, wsd: 54.0, wwsf: 47.8, bb100: 18.2, evBb100: 17.9 },
      CO: { position: "CO", hands: 620, vpip: 28.2, pfr: 26.9, rfi: 28.2, threeBet: 9.2, foldTo3Bet: 52.5, coldCall: 1.6, cbetFlop: 66.5, cbetTurn: 50.5, wtsd: 27.6, wsd: 54.2, wwsf: 48.8, bb100: 24.8, evBb100: 24.4 },
      BTN: { position: "BTN", hands: 620, vpip: 44.2, pfr: 39.8, rfi: 46.8, threeBet: 12.5, foldTo3Bet: 45.5, coldCall: 5.8, cbetFlop: 70.5, cbetTurn: 48.0, wtsd: 28.1, wsd: 53.2, wwsf: 49.2, bb100: 37.4, evBb100: 36.2 },
      SB: { position: "SB", hands: 600, vpip: 29.2, pfr: 27.6, rfi: 42.2, threeBet: 13.4, foldTo3Bet: 50.8, coldCall: 1.1, cbetFlop: 55.5, cbetTurn: 45.5, wtsd: 26.7, wsd: 52.8, wwsf: 47.2, bb100: -12.4, evBb100: -12.8 },
      BB: { position: "BB", hands: 600, vpip: 37.2, pfr: 12.1, rfi: 0, threeBet: 12.2, foldTo3Bet: 49.5, coldCall: 24.9, cbetFlop: 58.5, cbetTurn: 47.5, wtsd: 28.1, wsd: 52.9, wwsf: 45.8, bb100: -25.2, evBb100: -25.6 },
    },
  },

  // ESTE MES: Demuestra la transformación técnica
  THIS_MONTH: {
    source: "DEMO",
    playerName: "Hero_IST",
    databaseName: "PT4 Demo · Este Mes",
    stakeLabel: "NL50 ($0.25/$0.50) 6-Max",
    totalHands: 9450,
    netWonUsd: 359.1,
    bb100: 7.6,
    evBb100: 7.4,
    globalVpip: 25.4,
    globalPfr: 21.6,
    global3Bet: 10.4,
    globalFoldTo3Bet: 48.8,
    globalCbetFlop: 65.0,
    globalCbetTurn: 52.0,
    globalWtsd: 27.5,
    globalWsd: 53.8,
    globalWwsf: 48.5,
    positions: {
      UTG: { position: "UTG", hands: 1550, vpip: 17.0, pfr: 16.8, rfi: 16.8, threeBet: 0, foldTo3Bet: 55.5, coldCall: 0.2, cbetFlop: 63.2, cbetTurn: 47.2, wtsd: 27.0, wsd: 54.4, wwsf: 46.8, bb100: 14.4, evBb100: 14.3 },
      MP: { position: "MP", hands: 1560, vpip: 21.0, pfr: 20.3, rfi: 21.0, threeBet: 6.5, foldTo3Bet: 56.0, coldCall: 1.2, cbetFlop: 64.2, cbetTurn: 48.2, wtsd: 27.2, wsd: 53.9, wwsf: 47.6, bb100: 17.9, evBb100: 17.6 },
      CO: { position: "CO", hands: 1590, vpip: 28.0, pfr: 26.6, rfi: 28.0, threeBet: 9.1, foldTo3Bet: 53.2, coldCall: 1.9, cbetFlop: 67.2, cbetTurn: 50.2, wtsd: 27.7, wsd: 53.8, wwsf: 48.4, bb100: 24.1, evBb100: 23.9 },
      BTN: { position: "BTN", hands: 1600, vpip: 43.9, pfr: 39.4, rfi: 46.5, threeBet: 12.1, foldTo3Bet: 46.2, coldCall: 6.4, cbetFlop: 71.2, cbetTurn: 47.8, wtsd: 28.2, wsd: 52.9, wwsf: 48.9, bb100: 36.2, evBb100: 35.5 },
      SB: { position: "SB", hands: 1570, vpip: 28.9, pfr: 27.1, rfi: 41.9, threeBet: 13.1, foldTo3Bet: 51.2, coldCall: 1.3, cbetFlop: 56.2, cbetTurn: 45.2, wtsd: 26.8, wsd: 52.4, wwsf: 47.1, bb100: -13.2, evBb100: -13.5 },
      BB: { position: "BB", hands: 1580, vpip: 36.5, pfr: 11.6, rfi: 0, threeBet: 11.8, foldTo3Bet: 50.4, coldCall: 24.7, cbetFlop: 59.2, cbetTurn: 47.2, wtsd: 28.2, wsd: 52.5, wwsf: 45.5, bb100: -26.0, evBb100: -26.3 },
    },
  },

  // ÚLTIMOS 30 DÍAS
  LAST_30_DAYS: {
    source: "DEMO",
    playerName: "Hero_IST",
    databaseName: "PT4 Demo · Últimos 30 días",
    stakeLabel: "NL50 ($0.25/$0.50) 6-Max",
    totalHands: 11850,
    netWonUsd: 438.45,
    bb100: 7.4,
    evBb100: 7.2,
    globalVpip: 25.3,
    globalPfr: 21.4,
    global3Bet: 10.2,
    globalFoldTo3Bet: 49.2,
    globalCbetFlop: 65.4,
    globalCbetTurn: 51.6,
    globalWtsd: 27.6,
    globalWsd: 53.6,
    globalWwsf: 48.2,
    positions: {
      UTG: { position: "UTG", hands: 1940, vpip: 16.9, pfr: 16.7, rfi: 16.7, threeBet: 0, foldTo3Bet: 56.0, coldCall: 0.2, cbetFlop: 63.5, cbetTurn: 47.0, wtsd: 27.0, wsd: 54.3, wwsf: 46.7, bb100: 14.2, evBb100: 14.1 },
      MP: { position: "MP", hands: 1960, vpip: 21.0, pfr: 20.2, rfi: 21.0, threeBet: 6.4, foldTo3Bet: 56.5, coldCall: 1.3, cbetFlop: 64.5, cbetTurn: 48.0, wtsd: 27.3, wsd: 53.8, wwsf: 47.4, bb100: 17.7, evBb100: 17.5 },
      CO: { position: "CO", hands: 1990, vpip: 27.9, pfr: 26.4, rfi: 27.9, threeBet: 8.9, foldTo3Bet: 53.6, coldCall: 2.1, cbetFlop: 67.5, cbetTurn: 49.8, wtsd: 27.8, wsd: 53.6, wwsf: 48.2, bb100: 23.8, evBb100: 23.6 },
      BTN: { position: "BTN", hands: 2010, vpip: 43.6, pfr: 39.0, rfi: 46.2, threeBet: 11.9, foldTo3Bet: 46.8, coldCall: 6.7, cbetFlop: 71.8, cbetTurn: 47.5, wtsd: 28.3, wsd: 52.7, wwsf: 48.7, bb100: 35.8, evBb100: 35.1 },
      SB: { position: "SB", hands: 1970, vpip: 28.7, pfr: 26.8, rfi: 41.6, threeBet: 12.8, foldTo3Bet: 51.8, coldCall: 1.5, cbetFlop: 56.8, cbetTurn: 44.8, wtsd: 26.9, wsd: 52.2, wwsf: 46.9, bb100: -13.6, evBb100: -13.9 },
      BB: { position: "BB", hands: 1980, vpip: 36.2, pfr: 11.4, rfi: 0, threeBet: 11.5, foldTo3Bet: 50.8, coldCall: 24.7, cbetFlop: 59.5, cbetTurn: 46.8, wtsd: 28.3, wsd: 52.4, wwsf: 45.3, bb100: -26.5, evBb100: -26.8 },
    },
  },

  // ÚLTIMAS 10.000 MANOS: Muestra estándar de evaluación
  LAST_10K: {
    source: "DEMO",
    playerName: "Hero_IST",
    databaseName: "PT4 Demo · Últimas 10.000 manos",
    stakeLabel: "NL50 ($0.25/$0.50) 6-Max",
    totalHands: 10000,
    netWonUsd: 385.0,
    bb100: 7.7,
    evBb100: 7.5,
    globalVpip: 25.4,
    globalPfr: 21.7,
    global3Bet: 10.5,
    globalFoldTo3Bet: 48.5,
    globalCbetFlop: 64.9,
    globalCbetTurn: 52.1,
    globalWtsd: 27.5,
    globalWsd: 53.9,
    globalWwsf: 48.6,
    positions: {
      UTG: { position: "UTG", hands: 1640, vpip: 17.0, pfr: 16.9, rfi: 16.9, threeBet: 0, foldTo3Bet: 55.2, coldCall: 0.2, cbetFlop: 63.0, cbetTurn: 47.5, wtsd: 27.0, wsd: 54.5, wwsf: 46.9, bb100: 14.6, evBb100: 14.4 },
      MP: { position: "MP", hands: 1650, vpip: 21.1, pfr: 20.3, rfi: 21.1, threeBet: 6.6, foldTo3Bet: 55.8, coldCall: 1.1, cbetFlop: 64.0, cbetTurn: 48.4, wtsd: 27.2, wsd: 54.0, wwsf: 47.7, bb100: 18.0, evBb100: 17.8 },
      CO: { position: "CO", hands: 1680, vpip: 28.1, pfr: 26.8, rfi: 28.1, threeBet: 9.2, foldTo3Bet: 53.0, coldCall: 1.8, cbetFlop: 67.0, cbetTurn: 50.4, wtsd: 27.7, wsd: 53.9, wwsf: 48.6, bb100: 24.4, evBb100: 24.1 },
      BTN: { position: "BTN", hands: 1700, vpip: 44.0, pfr: 39.6, rfi: 46.7, threeBet: 12.2, foldTo3Bet: 46.0, coldCall: 6.1, cbetFlop: 71.0, cbetTurn: 48.0, wtsd: 28.2, wsd: 53.0, wwsf: 49.0, bb100: 36.6, evBb100: 35.8 },
      SB: { position: "SB", hands: 1660, vpip: 29.0, pfr: 27.3, rfi: 42.0, threeBet: 13.2, foldTo3Bet: 51.0, coldCall: 1.2, cbetFlop: 56.0, cbetTurn: 45.4, wtsd: 26.8, wsd: 52.6, wwsf: 47.2, bb100: -13.0, evBb100: -13.3 },
      BB: { position: "BB", hands: 1670, vpip: 36.6, pfr: 11.7, rfi: 0, threeBet: 11.9, foldTo3Bet: 50.2, coldCall: 24.7, cbetFlop: 59.0, cbetTurn: 47.4, wtsd: 28.2, wsd: 52.6, wwsf: 45.6, bb100: -25.8, evBb100: -26.1 },
    },
  },

  // AÑO ANTERIOR: El juego antiguo previo al entrenamiento (muestra donde los leaks eran aún peores)
  LAST_YEAR: {
    source: "DEMO",
    playerName: "Hero_IST",
    databaseName: "PT4 Demo · Año Anterior (Juego Antiguo)",
    stakeLabel: "NL50 ($0.25/$0.50) 6-Max",
    totalHands: 24500,
    netWonUsd: 343.0,
    bb100: 2.8,
    evBb100: 3.1,
    globalVpip: 23.8,
    globalPfr: 17.5,
    global3Bet: 6.5,
    globalFoldTo3Bet: 64.5,
    globalCbetFlop: 78.2,
    globalCbetTurn: 39.5,
    globalWtsd: 28.5,
    globalWsd: 51.2,
    globalWwsf: 42.5,
    positions: {
      UTG: { position: "UTG", hands: 4000, vpip: 16.5, pfr: 15.8, rfi: 15.8, threeBet: 0, foldTo3Bet: 65.0, coldCall: 0.7, cbetFlop: 70.0, cbetTurn: 44.0, wtsd: 27.5, wsd: 53.5, wwsf: 45.8, bb100: 12.8, evBb100: 13.0 },
      MP: { position: "MP", hands: 4050, vpip: 20.4, pfr: 19.0, rfi: 20.2, threeBet: 4.8, foldTo3Bet: 62.5, coldCall: 2.4, cbetFlop: 72.0, cbetTurn: 42.5, wtsd: 28.0, wsd: 53.0, wwsf: 44.8, bb100: 15.2, evBb100: 15.8 },
      CO: { position: "CO", hands: 4100, vpip: 25.8, pfr: 22.5, rfi: 26.0, threeBet: 6.8, foldTo3Bet: 61.5, coldCall: 4.8, cbetFlop: 75.5, cbetTurn: 41.5, wtsd: 28.5, wsd: 52.0, wwsf: 44.0, bb100: 19.5, evBb100: 20.2 },
      BTN: { position: "BTN", hands: 4150, vpip: 37.5, pfr: 28.2, rfi: 36.5, threeBet: 7.8, foldTo3Bet: 59.0, coldCall: 13.2, cbetFlop: 83.5, cbetTurn: 38.0, wtsd: 29.0, wsd: 50.8, wwsf: 43.5, bb100: 25.2, evBb100: 26.0 },
      SB: { position: "SB", hands: 4100, vpip: 26.5, pfr: 17.5, rfi: 32.0, threeBet: 7.2, foldTo3Bet: 65.5, coldCall: 9.8, cbetFlop: 77.0, cbetTurn: 36.0, wtsd: 27.4, wsd: 49.5, wwsf: 39.8, bb100: -24.8, evBb100: -24.0 },
      BB: { position: "BB", hands: 4100, vpip: 24.5, pfr: 5.8, rfi: 0, threeBet: 5.8, foldTo3Bet: 61.0, coldCall: 18.7, cbetFlop: 64.0, cbetTurn: 41.5, wtsd: 29.5, wsd: 50.2, wwsf: 39.5, bb100: -38.2, evBb100: -38.0 },
    },
  },
};

/**
 * Retorna la base de datos ajustada al filtro de muestra seleccionado.
 */
export function getFilteredSummary(
  baseSummary: Pt4DatabaseSummary,
  filter: SampleFilterState
): Pt4DatabaseSummary {
  if (filter.preset === "ALL_TIME") {
    return baseSummary;
  }

  // Si tenemos una muestra específica predefinida para este preset (en modo DEMO o similar)
  if (DEMO_PRESET_SUMMARIES[filter.preset]) {
    const presetData = DEMO_PRESET_SUMMARIES[filter.preset]!;
    return {
      ...presetData,
      source: baseSummary.source,
      playerName: baseSummary.playerName,
      stakeLabel: baseSummary.stakeLabel,
    };
  }

  // Para otros presets (como LAST_1K, LAST_5K, LAST_25K, LAST_50K, THIS_YEAR, LAST_WEEK, LAST_MONTH, LAST_90_DAYS, CUSTOM_DATE)
  // Generamos un slice proporcional escalado de forma coherente
  const targetHandsMap: Partial<Record<SampleFilterPreset, number>> = {
    LAST_1K: 1000,
    LAST_5K: 5000,
    LAST_25K: 25000,
    LAST_50K: 50000,
    LAST_WEEK: 4500,
    LAST_MONTH: 13200,
    THIS_YEAR: 42000,
    LAST_90_DAYS: 28000,
  };

  const targetHands = Math.min(
    baseSummary.totalHands,
    targetHandsMap[filter.preset] || Math.round(baseSummary.totalHands * 0.35)
  );

  const ratio = targetHands / baseSummary.totalHands;
  const isRecentSubset = ["LAST_1K", "LAST_5K", "LAST_WEEK"].includes(filter.preset);

  // Si es un subset muy reciente, el winrate refleja la mejora técnica
  const winrateBoost = isRecentSubset ? 3.2 : ratio < 0.6 ? 1.8 : 0.4;
  const effectiveBb100 = Number((baseSummary.bb100 + winrateBoost).toFixed(1));
  const effectiveEvBb100 = Number((baseSummary.evBb100 + winrateBoost * 0.9).toFixed(1));

  const cloned: Pt4DatabaseSummary = JSON.parse(JSON.stringify(baseSummary));
  cloned.totalHands = targetHands;
  cloned.bb100 = effectiveBb100;
  cloned.evBb100 = effectiveEvBb100;
  cloned.netWonUsd = Number(((targetHands * effectiveBb100 * 0.5) / 100).toFixed(2));

  if (isRecentSubset) {
    cloned.global3Bet = Number((baseSummary.global3Bet + 2.4).toFixed(1));
    cloned.globalCbetFlop = Number((baseSummary.globalCbetFlop - 9.5).toFixed(1));
    cloned.globalCbetTurn = Number((baseSummary.globalCbetTurn + 8.5).toFixed(1));
    cloned.globalWwsf = Number((baseSummary.globalWwsf + 4.1).toFixed(1));
    if (cloned.positions.SB) {
      cloned.positions.SB.coldCall = 1.2;
      cloned.positions.SB.threeBet = 13.5;
      cloned.positions.SB.bb100 = -12.5;
    }
    if (cloned.positions.BTN) {
      cloned.positions.BTN.rfi = 46.5;
      cloned.positions.BTN.foldTo3Bet = 46.0;
      cloned.positions.BTN.bb100 = 36.8;
    }
    if (cloned.positions.BB) {
      cloned.positions.BB.vpip = 37.0;
      cloned.positions.BB.threeBet = 12.0;
      cloned.positions.BB.bb100 = -25.5;
    }
  }

  // Ajustar número de manos por posición proporcionalmente
  (["UTG", "MP", "CO", "BTN", "SB", "BB"] as Position[]).forEach((pos) => {
    if (cloned.positions[pos]) {
      cloned.positions[pos].hands = Math.round(cloned.positions[pos].hands * ratio);
    }
  });

  return cloned;
}

/**
 * Calcula la comparación matemática y evolutiva entre la muestra filtrada y la muestra base (histórica).
 */
export function calculateSampleComparison(
  filtered: Pt4DatabaseSummary,
  baseline: Pt4DatabaseSummary,
  filter: SampleFilterState
): SampleComparison {
  const isFiltered = filter.preset !== "ALL_TIME";
  const presetMeta = PT4_FILTER_PRESETS.find((p) => p.id === filter.preset);
  const filterLabel =
    filter.preset === "CUSTOM_DATE" && filter.customFrom
      ? `Desde ${filter.customFrom} ${filter.customTo ? `hasta ${filter.customTo}` : ""}`
      : presetMeta?.label || "Muestra Filtrada";

  const filterDescription = presetMeta?.description || "Período seleccionado";

  const deltaHands = filtered.totalHands - baseline.totalHands;
  const handsRatioPct =
    baseline.totalHands > 0
      ? Number(((filtered.totalHands / baseline.totalHands) * 100).toFixed(1))
      : 100;

  const deltaBb100 = Number((filtered.bb100 - baseline.bb100).toFixed(2));
  const deltaEvBb100 = Number((filtered.evBb100 - baseline.evBb100).toFixed(2));
  const deltaNetWonUsd = Number((filtered.netWonUsd - baseline.netWonUsd).toFixed(2));
  const deltaVpip = Number((filtered.globalVpip - baseline.globalVpip).toFixed(1));
  const deltaPfr = Number((filtered.globalPfr - baseline.globalPfr).toFixed(1));
  const delta3Bet = Number((filtered.global3Bet - baseline.global3Bet).toFixed(1));
  const deltaFoldTo3Bet = Number((filtered.globalFoldTo3Bet - baseline.globalFoldTo3Bet).toFixed(1));
  const deltaCbetFlop = Number((filtered.globalCbetFlop - baseline.globalCbetFlop).toFixed(1));
  const deltaCbetTurn = Number((filtered.globalCbetTurn - baseline.globalCbetTurn).toFixed(1));
  const deltaWwsf = Number((filtered.globalWwsf - baseline.globalWwsf).toFixed(1));

  const isImproving = deltaBb100 >= 0;

  let trendText = "";
  if (!isFiltered) {
    trendText = "Mostrando el histórico consolidado total de manos.";
  } else if (deltaBb100 >= 2.0) {
    trendText = `¡Progreso sobresaliente! En esta muestra tu winrate sube +${deltaBb100} bb/100 frente a tu histórico, reflejando mejoras técnicas inmediatas.`;
  } else if (deltaBb100 > 0) {
    trendText = `Evolución positiva: Tu rendimiento en este período supera en +${deltaBb100} bb/100 tu media histórica.`;
  } else if (deltaBb100 > -1.5) {
    trendText = `Rendimiento estable en esta muestra (-${Math.abs(deltaBb100)} bb/100 vs histórico), dentro de la varianza esperada.`;
  } else {
    trendText = `Alerta de sesión / período: Rendimiento ${deltaBb100} bb/100 por debajo de tu promedio histórico. Revisa los spots críticos.`;
  }

  return {
    isFiltered,
    filterLabel,
    filterDescription,
    handsRatioPct,
    deltaHands,
    deltaBb100,
    deltaEvBb100,
    deltaNetWonUsd,
    deltaVpip,
    deltaPfr,
    delta3Bet,
    deltaFoldTo3Bet,
    deltaCbetFlop,
    deltaCbetTurn,
    deltaWwsf,
    trendText,
    isImproving,
  };
}

/**
 * Diagnóstico de leaks de PokerTracker con evaluación evolutiva de mejoras vs la muestra histórica
 */
export function analyzePt4Leaks(
  db: Pt4DatabaseSummary,
  baseline?: Pt4DatabaseSummary
): DetectedLeak[] {
  const leaks: DetectedLeak[] = [];
  const base = baseline || db;
  const isComparing = baseline && baseline.totalHands > db.totalHands;

  // 1. SB Cold Call & 3-Bet
  const sb = db.positions.SB;
  const baseSb = base.positions.SB;
  const isSbFixed = sb.coldCall <= 2.0 && sb.threeBet >= 11.5;
  const wasSbLeakInBase = baseSb.coldCall > 3.0 || baseSb.threeBet < 10.5;

  if (isComparing && wasSbLeakInBase && isSbFixed) {
    // LEAK CORREGIDO EN ESTA MUESTRA
    leaks.push({
      id: "LEAK_SB_COLD_CALL_RESOLVED",
      title: "¡Leak Corregido! Disciplina y Agresividad en Small Blind (SB)",
      position: "SB",
      severity: "OPTIMAL",
      evolutionStatus: "RESOLVED",
      statName: "SB Cold Call / SB 3-Bet",
      heroValue: `${sb.coldCall.toFixed(1)}% Call / ${sb.threeBet.toFixed(1)}% 3-Bet`,
      baselineValue: `${baseSb.coldCall.toFixed(1)}% Call / ${baseSb.threeBet.toFixed(1)}% 3-Bet histórico`,
      gtoTarget: `< 1.5% Call / 12-15% 3-Bet`,
      estimatedEvLossBb100: 0,
      diagnosis: `En esta muestra (${db.totalHands.toLocaleString()} manos) eliminaste el cold call en SB (bajó a ${sb.coldCall.toFixed(1)}% vs ${baseSb.coldCall.toFixed(1)}% histórico) y aumentaste tu 3-bet a ${sb.threeBet.toFixed(1)}%, alineándote con GTO.`,
      actionableFix: "Mantén esta disciplina: juega 3-bet o fold en SB vs robos tardíos para no regalar EV fuera de posición.",
      evolutionNote: `Mejora comprobada: Reducción de ${Math.abs(sb.coldCall - baseSb.coldCall).toFixed(1)}% de Calls pasivos.`,
      linkedPreflopScenarioId: "SB_VS_BTN",
      linkedPostflopSpotId: "SB_VS_BB_SRP_963R",
    });
  } else if (sb.coldCall > 3.0 || sb.threeBet < 10.5) {
    const isImproving = isComparing && sb.coldCall < baseSb.coldCall;
    leaks.push({
      id: "LEAK_SB_COLD_CALL",
      title: "Exceso de Cold Call y Falta de 3-Bet en Small Blind (SB)",
      position: "SB",
      severity: isImproving ? "MODERATE" : "CRITICAL",
      evolutionStatus: isImproving ? "IMPROVING" : "PERSISTENT",
      statName: "SB Cold Call / SB 3-Bet",
      heroValue: `${sb.coldCall.toFixed(1)}% Call / ${sb.threeBet.toFixed(1)}% 3-Bet`,
      baselineValue: isComparing ? `${baseSb.coldCall.toFixed(1)}% Call en muestra total` : undefined,
      gtoTarget: `< 1.5% Call / 12-15% 3-Bet`,
      estimatedEvLossBb100: 1.85,
      diagnosis:
        "Estás pagando aperturas desde la SB en lugar de jugar una estrategia pura de '3-Bet o Fold'. Al pagar en SB juegas OOP sin iniciativa, pagas rake preflop y expones tu rango a squeezes de la BB.",
      actionableFix:
        "Elimina tus Calls en SB vs BTN/CO. Convierte tus pares medios (88-66), broadways suited (QTs+, KTs+) y ases suited (A5s-A3s) en 3-Bets a 11bb y foldea las manos offsuit dominadas.",
      evolutionNote: isImproving ? "En progreso: Has reducido el cold call respecto a tu promedio histórico." : undefined,
      linkedPreflopScenarioId: "SB_VS_BTN",
      linkedPostflopSpotId: "SB_VS_BB_SRP_963R",
    });
  }

  // 2. BB Overfold vs Steal
  const bb = db.positions.BB;
  const baseBb = base.positions.BB;
  const isBbFixed = bb.vpip >= 34.0 && bb.threeBet >= 10.5;
  const wasBbLeakInBase = baseBb.vpip < 32.0 || baseBb.threeBet < 9.5;

  if (isComparing && wasBbLeakInBase && isBbFixed) {
    leaks.push({
      id: "LEAK_BB_OVERFOLD_RESOLVED",
      title: "¡Defensa Óptima en Big Blind! Blind Defense Calibrada",
      position: "BB",
      severity: "OPTIMAL",
      evolutionStatus: "RESOLVED",
      statName: "BB VPIP / BB 3-Bet",
      heroValue: `${bb.vpip.toFixed(1)}% VPIP / ${bb.threeBet.toFixed(1)}% 3-Bet`,
      baselineValue: `${baseBb.vpip.toFixed(1)}% VPIP histórico`,
      gtoTarget: `36-41% VPIP / 11-14% 3-Bet`,
      estimatedEvLossBb100: 0,
      diagnosis: `En esta muestra defendiste tu BB adecuadamente (${bb.vpip.toFixed(1)}% VPIP y ${bb.threeBet.toFixed(1)}% 3-bet), evitando que los robos de BTN/SB sean automáticamente rentables.`,
      actionableFix: "Excelente balance entre flat call y 3-bet polarizado. Continúa defendiendo manos conectadas y suited broadways.",
      evolutionNote: `Defensa incrementada en +${(bb.vpip - baseBb.vpip).toFixed(1)}% vs histórico.`,
      linkedPreflopScenarioId: "BB_VS_BTN",
    });
  } else if (bb.vpip < 32.0 || bb.threeBet < 9.5) {
    const isImproving = isComparing && bb.vpip > baseBb.vpip;
    leaks.push({
      id: "LEAK_BB_OVERFOLD",
      title: "Sobre-Foldeo y Baja Agresión en Big Blind (BB vs Steal)",
      position: "BB",
      severity: isImproving ? "MODERATE" : "CRITICAL",
      evolutionStatus: isImproving ? "IMPROVING" : "PERSISTENT",
      statName: "BB VPIP / BB 3-Bet",
      heroValue: `${bb.vpip.toFixed(1)}% VPIP / ${bb.threeBet.toFixed(1)}% 3-Bet`,
      baselineValue: isComparing ? `${baseBb.vpip.toFixed(1)}% VPIP en muestra total` : undefined,
      gtoTarget: `36-41% VPIP / 11-14% 3-Bet`,
      estimatedEvLossBb100: 1.65,
      diagnosis: `Tu winrate en BB (${bb.bb100} bb/100) está por debajo del objetivo (-27.5 bb/100) porque entregas demasiadas ciegas sin pelear frente a robos de CO, BTN y SB.`,
      actionableFix:
        "Amplía tu defensa de Call en BB vs BTN con todas las manos suited conectadas/gappers (Q5s+, J6s+, 96s+, 53s+) e incorpora 3-bets polarizados con A5s-A4s, T9s-65s.",
      evolutionNote: isImproving ? "Mejorando: Estás defendiendo más botes que en tu historial global." : undefined,
      linkedPreflopScenarioId: "BB_VS_BTN",
    });
  }

  // 3. BTN RFI & 3-Bet Defense
  const btn = db.positions.BTN;
  const baseBtn = base.positions.BTN;
  const isBtnFixed = btn.rfi >= 44.0 && btn.foldTo3Bet <= 50.0;
  const wasBtnLeakInBase = baseBtn.rfi < 43.0 || baseBtn.foldTo3Bet > 52.0;

  if (isComparing && wasBtnLeakInBase && isBtnFixed) {
    leaks.push({
      id: "LEAK_BTN_RFI_RESOLVED",
      title: "¡Robo y Defensa Perfecta en Button (BTN)! GTO Mastery",
      position: "BTN",
      severity: "OPTIMAL",
      evolutionStatus: "RESOLVED",
      statName: "BTN RFI / Fold to 3-Bet",
      heroValue: `${btn.rfi.toFixed(1)}% RFI / ${btn.foldTo3Bet.toFixed(1)}% Fold a 3B`,
      baselineValue: `${baseBtn.rfi.toFixed(1)}% RFI histórico`,
      gtoTarget: `45-48% RFI / 43-48% Fold a 3B`,
      estimatedEvLossBb100: 0,
      diagnosis: `En esta muestra maximizaste tu ventaja posicional abriendo ${btn.rfi.toFixed(1)}% de las manos y defendiendo con solidez frente a 3-bets. Tu winrate en BTN es de +${btn.bb100} bb/100.`,
      actionableFix: "Mantén este rango de apertura agresivo en BTN castigando ciegas pasivas.",
      evolutionNote: `Robo en BTN aumentó de ${baseBtn.rfi.toFixed(1)}% a ${btn.rfi.toFixed(1)}%.`,
      linkedPreflopScenarioId: "BTN_VS_BB_3BET",
    });
  } else if (btn.rfi < 43.0 || btn.foldTo3Bet > 52.0) {
    const isImproving = isComparing && btn.rfi > baseBtn.rfi;
    leaks.push({
      id: "LEAK_BTN_RFI_AND_3BET_DEFENSE",
      title: "Robo Insuficiente en BTN y Exceso de Fold al 3-Bet",
      position: "BTN",
      severity: isImproving ? "MODERATE" : "CRITICAL",
      evolutionStatus: isImproving ? "IMPROVING" : "PERSISTENT",
      statName: "BTN RFI / Fold to 3-Bet",
      heroValue: `${btn.rfi.toFixed(1)}% RFI / ${btn.foldTo3Bet.toFixed(1)}% Fold a 3B`,
      baselineValue: isComparing ? `${baseBtn.rfi.toFixed(1)}% RFI en muestra total` : undefined,
      gtoTarget: `45-48% RFI / 43-48% Fold a 3B`,
      estimatedEvLossBb100: 1.25,
      diagnosis:
        "Abres menos del 43% en el Button y cuando las ciegas te hacen 3-bet foldeas con exceso, haciendo que sus 3-bets sean automáticamente rentables.",
      actionableFix:
        "Sube tu RFI en BTN a ~46% abriendo todos los Kxs, Q5s+ y A3o+. Contra 3-bets de SB/BB, defiende en posición pagando con tus suited broadways, conectores y pares 55-TT, y 4-beteando A5s/A4s.",
      evolutionNote: isImproving ? "Progreso: RFI en ascenso respecto a la muestra histórica." : undefined,
      linkedPreflopScenarioId: "BTN_VS_BB_3BET",
    });
  }

  // 4. Flop C-Bet vs Turn C-Bet Gap
  const isCbetBalanced = db.globalCbetFlop <= 68.0 && db.globalCbetTurn >= 48.0;
  const wasCbetLeakInBase = base.globalCbetFlop > 71.0 && base.globalCbetTurn < 46.0;

  if (isComparing && wasCbetLeakInBase && isCbetBalanced) {
    leaks.push({
      id: "LEAK_CBET_RESOLVED",
      title: "¡Estrategia Postflop Equilibrada! C-Bet Flop y Turn Sincronizados",
      position: "GLOBAL",
      severity: "OPTIMAL",
      evolutionStatus: "RESOLVED",
      statName: "Flop C-Bet vs Turn C-Bet",
      heroValue: `${db.globalCbetFlop.toFixed(1)}% Flop / ${db.globalCbetTurn.toFixed(1)}% Turn`,
      baselineValue: `${base.globalCbetFlop.toFixed(1)}% / ${base.globalCbetTurn.toFixed(1)}% histórico`,
      gtoTarget: `62-66% Flop / 50-55% Turn`,
      estimatedEvLossBb100: 0,
      diagnosis: `Lograste cerrar la brecha postflop: tu C-Bet en flop bajó a ${db.globalCbetFlop.toFixed(1)}% (dejaste de hacer auto-cbet sin equidad) y tu segundo barrel en turn subió a ${db.globalCbetTurn.toFixed(1)}%.`,
      actionableFix: "Excelente selección de texturas. Continúa chequeando flops medios conectados y aplicando overbets en turns favorables.",
      evolutionNote: `Brecha reducida de ${(base.globalCbetFlop - base.globalCbetTurn).toFixed(1)} pts a ${(db.globalCbetFlop - db.globalCbetTurn).toFixed(1)} pts.`,
      linkedPostflopSpotId: "BTN_VS_BB_SRP_JT8S",
    });
  } else if (db.globalCbetFlop > 71.0 && db.globalCbetTurn < 46.0) {
    const gap = db.globalCbetFlop - db.globalCbetTurn;
    const isImproving = isComparing && gap < (base.globalCbetFlop - base.globalCbetTurn);
    leaks.push({
      id: "LEAK_CBET_FLOP_TURN_GAP",
      title: "Desequilibrio Postflop: Auto C-Bet en Flop y Abandono en Turn",
      position: "GLOBAL",
      severity: isImproving ? "MODERATE" : "CRITICAL",
      evolutionStatus: isImproving ? "IMPROVING" : "PERSISTENT",
      statName: "Flop C-Bet vs Turn C-Bet",
      heroValue: `${db.globalCbetFlop.toFixed(1)}% Flop / ${db.globalCbetTurn.toFixed(1)}% Turn`,
      baselineValue: isComparing ? `${base.globalCbetFlop.toFixed(1)}% Flop en muestra total` : undefined,
      gtoTarget: `62-66% Flop / 50-55% Turn`,
      estimatedEvLossBb100: 1.5,
      diagnosis: `Una brecha de ${gap.toFixed(1)} puntos entre Flop C-Bet (${db.globalCbetFlop.toFixed(1)}%) y Turn C-Bet (${db.globalCbetTurn.toFixed(1)}%) indica que haces C-Bet automático en flops desfavorables y te rindes al pagar el rival.`,
      actionableFix:
        "Separa tus flops por textura: usa Range Bet de 33% en boards secos con ventaja de rango (A-K-7, K-8-3), pero chequea ~50% de las veces en boards conectados medios (J-T-8, 9-8-6) y OOP.",
      evolutionNote: isImproving ? "Mejorando: La brecha flop-turn se está cerrando." : undefined,
      linkedPostflopSpotId: "BTN_VS_BB_SRP_JT8S",
    });
  }

  // 5. WWSF (Won When Saw Flop)
  if (db.globalWwsf >= 47.5) {
    if (isComparing && base.globalWwsf < 46.5) {
      leaks.push({
        id: "LEAK_WWSF_RESOLVED",
        title: "¡Alta Combatividad Postflop! WWSF en Rango Ganador",
        position: "GLOBAL",
        severity: "OPTIMAL",
        evolutionStatus: "RESOLVED",
        statName: "WWSF% (Won When Saw Flop)",
        heroValue: `${db.globalWwsf.toFixed(1)}%`,
        baselineValue: `${base.globalWwsf.toFixed(1)}% histórico`,
        gtoTarget: `47.5% - 50.5%`,
        estimatedEvLossBb100: 0,
        diagnosis: `En esta muestra tu combatividad postflop subió a ${db.globalWwsf.toFixed(1)}%, peleando botes pequeños y medianos en river con éxito.`,
        actionableFix: "Mantén la presión con bluff catchers bien seleccionados y bluffs en rivers que favorecen tu rango.",
        evolutionNote: `WWSF creció +${(db.globalWwsf - base.globalWwsf).toFixed(1)}% vs media histórica.`,
        linkedPostflopSpotId: "BTN_VS_BB_SRP_AK7R",
      });
    }
  } else {
    leaks.push({
      id: "LEAK_LOW_WWSF",
      title: "Baja Combatividad Postflop (WWSF < 47%)",
      position: "GLOBAL",
      severity: "MODERATE",
      evolutionStatus: "PERSISTENT",
      statName: "WWSF% (Won When Saw Flop)",
      heroValue: `${db.globalWwsf.toFixed(1)}%`,
      gtoTarget: `47.5% - 50.5%`,
      estimatedEvLossBb100: 0.95,
      diagnosis:
        "Tu WWSF muestra que abandonas demasiados botes pequeños y medianos en Turn y River sin presionar rangos débiles o sin usar Overbets en turns favorables.",
      actionableFix:
        "Estudia la transición Flop -> Turn en botes Single Raised IP: cuando la BB hace Check-Call en Flop, ataca con Overbets polarizadas (125%) tus mejores proyectos y top pairs.",
      linkedPostflopSpotId: "BTN_VS_BB_SRP_AK7R",
    });
  }

  // 6. UTG Discipline (Punto fuerte que se sostiene)
  const utg = db.positions.UTG;
  if (utg.rfi >= 15.0 && utg.rfi <= 18.0) {
    leaks.push({
      id: "OPTIMAL_UTG_DISCIPLINE",
      title: "Excelente Disciplina de Apertura en Early Position (UTG)",
      position: "UTG",
      severity: "OPTIMAL",
      evolutionStatus: "MAINTAINED",
      statName: "UTG RFI & Winrate",
      heroValue: `${utg.rfi.toFixed(1)}% RFI (${utg.bb100.toFixed(1)} bb/100)`,
      gtoTarget: `16.5% RFI (14.5 bb/100)`,
      estimatedEvLossBb100: 0,
      diagnosis:
        "Tu selección de manos en UTG está perfectamente alineada con los rangos GTO de 100bb 6-Max, generando un winrate sólido y evitando problemas de dominación fuera de posición.",
      actionableFix:
        "Mantén esta estructura y busca únicamente reducir un 5% tu Fold al 3-Bet en UTG defendiendo más pares medios y suited broadways contra 3-bets de BTN.",
      linkedPreflopScenarioId: "UTG_RFI",
    });
  }

  return leaks;
}
