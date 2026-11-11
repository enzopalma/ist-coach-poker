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

export interface DetectedLeak {
  id: string;
  title: string;
  position: Position | "GLOBAL";
  severity: "CRITICAL" | "MODERATE" | "OPTIMAL";
  statName: string;
  heroValue: string;
  gtoTarget: string;
  estimatedEvLossBb100: number;
  diagnosis: string;
  actionableFix: string;
  linkedPreflopScenarioId?: string;
  linkedPostflopSpotId?: string;
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

export function analyzePt4Leaks(db: Pt4DatabaseSummary): DetectedLeak[] {
  const leaks: DetectedLeak[] = [];

  // 1. Check SB Cold Call & Low 3-Bet
  const sb = db.positions.SB;
  if (sb.coldCall > 3.0 || sb.threeBet < 10.5) {
    leaks.push({
      id: "LEAK_SB_COLD_CALL",
      title: "Exceso de Cold Call y Falta de 3-Bet en Small Blind (SB)",
      position: "SB",
      severity: "CRITICAL",
      statName: "SB Cold Call / SB 3-Bet",
      heroValue: `${sb.coldCall.toFixed(1)}% Call / ${sb.threeBet.toFixed(1)}% 3-Bet`,
      gtoTarget: `< 1.5% Call / 12-15% 3-Bet`,
      estimatedEvLossBb100: 1.85,
      diagnosis:
        "Estás pagando aperturas desde la SB en lugar de jugar una estrategia pura de '3-Bet o Fold'. Al pagar en SB juegas OOP sin iniciativa, pagas rake preflop y expones tu rango a squeezes de la BB.",
      actionableFix:
        "Elimina tus Calls en SB vs BTN/CO. Convierte tus pares medios (88-66), broadways suited (QTs+, KTs+) y ases suited (A5s-A3s) en 3-Bets a 11bb y foldea las manos offsuit dominadas.",
      linkedPreflopScenarioId: "SB_VS_BTN",
      linkedPostflopSpotId: "SB_VS_BB_SRP_963R",
    });
  }

  // 2. Check BB Under-Defense & Low 3-Bet vs Steals
  const bb = db.positions.BB;
  if (bb.vpip < 32.0 || bb.threeBet < 9.5) {
    leaks.push({
      id: "LEAK_BB_OVERFOLD",
      title: "Sobre-Foldeo y Baja Agresión en Big Blind (BB vs Steal)",
      position: "BB",
      severity: "CRITICAL",
      statName: "BB VPIP / BB 3-Bet",
      heroValue: `${bb.vpip.toFixed(1)}% VPIP / ${bb.threeBet.toFixed(1)}% 3-Bet`,
      gtoTarget: `36-41% VPIP / 11-14% 3-Bet`,
      estimatedEvLossBb100: 1.65,
      diagnosis:
        "Tu winrate en BB (-35.1 bb/100) está por debajo del objetivo (-27.5 bb/100) porque entregas demasiadas ciegas sin pelear frente a robos de CO, BTN y SB.",
      actionableFix:
        "Amplía tu defensa de Call en BB vs BTN con todas las manos suited conectadas/gappers (Q5s+, J6s+, 96s+, 53s+) e incorpora 3-bets polarizados con A5s-A4s, T9s-65s.",
      linkedPreflopScenarioId: "BB_VS_BTN",
    });
  }

  // 3. Check BTN RFI & Vs 3-Bet Defense
  const btn = db.positions.BTN;
  if (btn.rfi < 43.0 || btn.foldTo3Bet > 52.0) {
    leaks.push({
      id: "LEAK_BTN_RFI_AND_3BET_DEFENSE",
      title: "Robo Insuficiente en BTN y Exceso de Fold al 3-Bet",
      position: "BTN",
      severity: "MODERATE",
      statName: "BTN RFI / Fold to 3-Bet",
      heroValue: `${btn.rfi.toFixed(1)}% RFI / ${btn.foldTo3Bet.toFixed(1)}% Fold a 3B`,
      gtoTarget: `45-48% RFI / 43-48% Fold a 3B`,
      estimatedEvLossBb100: 1.25,
      diagnosis:
        "Abres menos del 40% en el Button y cuando las ciegas te hacen 3-bet foldeas más del 56%, haciendo que sus 3-bets con cualquier dos cartas sean automáticamente rentables.",
      actionableFix:
        "Sube tu RFI en BTN a ~46% abriendo todos los Kxs, Q5s+ y A3o+. Contra 3-bets de SB/BB, defiende en posición pagando con tus suited broadways, conectores y pares 55-TT, y 4-beteando A5s/A4s.",
      linkedPreflopScenarioId: "BTN_VS_BB_3BET",
    });
  }

  // 4. Check Flop C-Bet Over-betting + Turn Barrel Drop-off
  if (db.globalCbetFlop > 71.0 && db.globalCbetTurn < 46.0) {
    leaks.push({
      id: "LEAK_CBET_FLOP_TURN_GAP",
      title: "Desequilibrio Postflop: Auto C-Bet en Flop y Abandono en Turn",
      position: "GLOBAL",
      severity: "CRITICAL",
      statName: "Flop C-Bet vs Turn C-Bet",
      heroValue: `${db.globalCbetFlop.toFixed(1)}% Flop / ${db.globalCbetTurn.toFixed(1)}% Turn`,
      gtoTarget: `62-66% Flop / 50-55% Turn`,
      estimatedEvLossBb100: 1.5,
      diagnosis:
        "Una brecha mayor a 30 puntos entre Flop C-Bet (74.5%) y Turn C-Bet (43.2%) indica que haces C-Bet automático en flops dinámicos/coordinados (como J-T-8) o fuera de posición, y luego te rindes en el Turn cuando te pagan.",
      actionableFix:
        "Separa tus flops por textura: usa Range Bet de 33% solo en boards secos con ventaja de rango (A-K-7, K-8-3), pero chequea ~50% de las veces en boards conectados medios (J-T-8, 9-8-6) y en guerra de ciegas OOP.",
      linkedPostflopSpotId: "BTN_VS_BB_SRP_JT8S",
    });
  }

  // 5. Check WWSF (Won When Saw Flop)
  if (db.globalWwsf < 46.5) {
    leaks.push({
      id: "LEAK_LOW_WWSF",
      title: "Baja Combatividad Postflop (WWSF < 47%)",
      position: "GLOBAL",
      severity: "MODERATE",
      statName: "WWSF% (Won When Saw Flop)",
      heroValue: `${db.globalWwsf.toFixed(1)}%`,
      gtoTarget: `47.5% - 50.5%`,
      estimatedEvLossBb100: 0.95,
      diagnosis:
        "Tu WWSF de 44.1% muestra que abandonas demasiados botes pequeños y medianos en Turn y River sin presionar rangos débiles o sin usar Overbets en turns favorables.",
      actionableFix:
        "Estudia la transición Flop -> Turn en botes Single Raised IP: cuando la BB hace Check-Call en el Flop, ataca las cartas altas del Turn con Overbets polarizadas (125%) usando tus mejores proyectos y top pairs.",
      linkedPostflopSpotId: "BTN_VS_BB_SRP_AK7R",
    });
  }

  // 6. Solid UTG Discipline (Positive reinforcement)
  const utg = db.positions.UTG;
  if (utg.rfi >= 15.0 && utg.rfi <= 18.0) {
    leaks.push({
      id: "OPTIMAL_UTG_DISCIPLINE",
      title: "Excelente Disciplina de Apertura en Early Position (UTG)",
      position: "UTG",
      severity: "OPTIMAL",
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
