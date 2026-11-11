"use client";

import React, { useState } from "react";
import { Position } from "@/data/pokerRanges";
import {
  Brain,
  Flame,
  Trophy,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";

export interface StudyDrill {
  id: string;
  mode: "PREFLOP" | "POSTFLOP";
  isPt4LeakDrill: boolean;
  title: string;
  situationText: string;
  heroPos: Position;
  villainPos?: Position;
  potBb: number;
  heroCards: [
    { rank: string; suit: "s" | "h" | "d" | "c" },
    { rank: string; suit: "s" | "h" | "d" | "c" }
  ];
  handNotation: string;
  boardCards?: { rank: string; suit: "s" | "h" | "d" | "c" }[];
  options: {
    id: string;
    label: string;
    sublabel: string;
    frequencyPct: number;
    evBb: number;
    color: "fold" | "call" | "raise" | "overbet";
  }[];
  coachExplanation: string;
}

const STUDY_DRILLS: StudyDrill[] = [
  {
    id: "DRILL_SB_A5S_VS_BTN",
    mode: "PREFLOP",
    isPt4LeakDrill: true,
    title: "Defensa de SB vs BTN Open (3-Bet o Fold)",
    situationText:
      "BTN abre a 2.5 bb (100bb efectivos). Estás en Small Blind (SB) con A♥ 5♥.",
    heroPos: "SB",
    villainPos: "BTN",
    potBb: 4.0,
    heroCards: [
      { rank: "A", suit: "h" },
      { rank: "5", suit: "h" },
    ],
    handNotation: "A5s",
    options: [
      {
        id: "FOLD",
        label: "Fold",
        sublabel: "0.00 bb EV",
        frequencyPct: 0,
        evBb: 0,
        color: "fold",
      },
      {
        id: "CALL",
        label: "Call 2.5 bb",
        sublabel: "-0.18 bb EV (Leak PT4)",
        frequencyPct: 0,
        evBb: -0.18,
        color: "call",
      },
      {
        id: "3BET",
        label: "3-Bet a 11.0 bb",
        sublabel: "+0.64 bb EV (GTO)",
        frequencyPct: 100,
        evBb: 0.64,
        color: "raise",
      },
    ],
    coachExplanation:
      "En SB vs BTN jugamos '3-Bet o Fold'. A5s es el mejor 3-bet bluff/semibluff de la baraja: bloquea AA/AK del BTN y siempre tiene equidad de color nut y escalera wheel si te pagan.",
  },
  {
    id: "DRILL_POSTFLOP_AK7_33",
    mode: "POSTFLOP",
    isPt4LeakDrill: true,
    title: "C-Bet IP en Board Seco Broadway (A♠ K♦ 7♣)",
    situationText:
      "Abres en BTN a 2.5 bb y BB paga. El Flop es A♠ K♦ 7♣ (Bote: 5.5 bb). BB hace Check. Tienes Q♣ J♣.",
    heroPos: "BTN",
    villainPos: "BB",
    potBb: 5.5,
    heroCards: [
      { rank: "Q", suit: "c" },
      { rank: "J", suit: "c" },
    ],
    handNotation: "QJs",
    boardCards: [
      { rank: "A", suit: "s" },
      { rank: "K", suit: "d" },
      { rank: "7", suit: "c" },
    ],
    options: [
      {
        id: "CHECK",
        label: "Check Back",
        sublabel: "+1.12 bb EV",
        frequencyPct: 5,
        evBb: 1.12,
        color: "call",
      },
      {
        id: "BET_33",
        label: "Bet 33% (1.8 bb)",
        sublabel: "+1.68 bb EV (GTO)",
        frequencyPct: 85,
        evBb: 1.68,
        color: "raise",
      },
      {
        id: "BET_75",
        label: "Bet 75% (4.1 bb)",
        sublabel: "+1.35 bb EV",
        frequencyPct: 10,
        evBb: 1.35,
        color: "overbet",
      },
    ],
    coachExplanation:
      "En A-K-7 rainbow, BTN tiene una ventaja masiva de rango y de nuts. Apostamos 33% del bote (1.8 bb) con casi el 100% del rango. QJs tiene gutshot a la escalera nut, bloquea KQ/QJ y prepara un excelente 2nd barrel (Overbet) en el Turn.",
  },
  {
    id: "DRILL_POSTFLOP_JT8_CHECK",
    mode: "POSTFLOP",
    isPt4LeakDrill: true,
    title: "Control de Bote en Flop Dinámico Conectado (J♠ T♠ 8♦)",
    situationText:
      "Abres en BTN a 2.5 bb y BB paga. Flop: J♠ T♠ 8♦ (Bote: 5.5 bb). BB hace Check. Tienes 6♥ 6♣.",
    heroPos: "BTN",
    villainPos: "BB",
    potBb: 5.5,
    heroCards: [
      { rank: "6", suit: "h" },
      { rank: "6", suit: "c" },
    ],
    handNotation: "66",
    boardCards: [
      { rank: "J", suit: "s" },
      { rank: "T", suit: "s" },
      { rank: "8", suit: "d" },
    ],
    options: [
      {
        id: "CHECK",
        label: "Check Back",
        sublabel: "+0.82 bb EV (GTO)",
        frequencyPct: 95,
        evBb: 0.82,
        color: "call",
      },
      {
        id: "BET_33",
        label: "Bet 33% (1.8 bb)",
        sublabel: "+0.21 bb EV (Leak PT4)",
        frequencyPct: 0,
        evBb: 0.21,
        color: "raise",
      },
      {
        id: "BET_75",
        label: "Bet 75% (4.1 bb)",
        sublabel: "-0.34 bb EV",
        frequencyPct: 5,
        evBb: -0.34,
        color: "overbet",
      },
    ],
    coachExplanation:
      "En J♠ T♠ 8♦ la BB conecta muchísimo (escaleras, dobles parejas, pares + proyecto) y hace Check-Raise con alta frecuencia. Hacer 'Auto C-Bet 33%' con 66 es uno de los mayores leaks detectados en PT4: haz Check Back siempre.",
  },
  {
    id: "DRILL_BB_DEFENSE_Q7S",
    mode: "PREFLOP",
    isPt4LeakDrill: true,
    title: "Defensa de Big Blind vs Robo de BTN",
    situationText:
      "BTN abre a 2.5 bb y SB foldea. Estás en Big Blind (BB) con Q♦ 7♦ (debes poner 1.5 bb para un bote de 5.5 bb).",
    heroPos: "BB",
    villainPos: "BTN",
    potBb: 4.0,
    heroCards: [
      { rank: "Q", suit: "d" },
      { rank: "7", suit: "d" },
    ],
    handNotation: "Q7s",
    options: [
      {
        id: "FOLD",
        label: "Fold",
        sublabel: "0.00 bb EV (Sobre-foldeo)",
        frequencyPct: 0,
        evBb: 0,
        color: "fold",
      },
      {
        id: "CALL",
        label: "Call 1.5 bb",
        sublabel: "+0.39 bb EV (GTO)",
        frequencyPct: 100,
        evBb: 0.39,
        color: "call",
      },
      {
        id: "3BET",
        label: "3-Bet a 11.0 bb",
        sublabel: "-0.12 bb EV",
        frequencyPct: 0,
        evBb: -0.12,
        color: "raise",
      },
    ],
    coachExplanation:
      "Contra un robo a 2.5bb del BTN, la BB recibe excelentes pot odds y cierra la acción preflop. Q7s realiza muy bien su equidad gracias al proyecto de color y carta alta Reina: foldearla contribuye al leak de sobre-foldeo en BB.",
  },
  {
    id: "DRILL_BTN_VS_BB_3BET_98S",
    mode: "PREFLOP",
    isPt4LeakDrill: true,
    title: "Defensa en Posición contra 3-Bet de BB",
    situationText:
      "Abres a 2.5 bb en BTN con 9♠ 8♠ y la BB hace 3-Bet a 11.0 bb (100bb efectivos).",
    heroPos: "BTN",
    villainPos: "BB",
    potBb: 14.0,
    heroCards: [
      { rank: "9", suit: "s" },
      { rank: "8", suit: "s" },
    ],
    handNotation: "98s",
    options: [
      {
        id: "FOLD",
        label: "Fold",
        sublabel: "0.00 bb EV",
        frequencyPct: 0,
        evBb: 0,
        color: "fold",
      },
      {
        id: "CALL",
        label: "Call 8.5 bb (IP)",
        sublabel: "+0.78 bb EV (GTO)",
        frequencyPct: 100,
        evBb: 0.78,
        color: "call",
      },
      {
        id: "4BET",
        label: "4-Bet a 23.5 bb",
        sublabel: "+0.15 bb EV",
        frequencyPct: 0,
        evBb: 0.15,
        color: "raise",
      },
    ],
    coachExplanation:
      "Estando en posición (BTN vs BB), los conectores suited medios (T9s, 98s, 87s, 76s) son Calls puros contra el 3-bet: no están dominados por los Ases altos del 3-bettor y pueden ganar grandes botes cuando conectan.",
  },
  {
    id: "DRILL_TURN_OVERBET_AK72",
    mode: "POSTFLOP",
    isPt4LeakDrill: false,
    title: "Turn Overbet Polarizado tras Range Bet en Flop",
    situationText:
      "BTN vs BB (SRP). Apostaste 33% en A♠ K♦ 7♣ y BB pagó. El Turn es 2♥ (Bote: 9.1 bb). BB hace Check. Tienes A♥ Q♠.",
    heroPos: "BTN",
    villainPos: "BB",
    potBb: 9.1,
    heroCards: [
      { rank: "A", suit: "h" },
      { rank: "Q", suit: "s" },
    ],
    handNotation: "AQo",
    boardCards: [
      { rank: "A", suit: "s" },
      { rank: "K", suit: "d" },
      { rank: "7", suit: "c" },
      { rank: "2", suit: "h" },
    ],
    options: [
      {
        id: "CHECK",
        label: "Check Back",
        sublabel: "+3.40 bb EV",
        frequencyPct: 5,
        evBb: 3.4,
        color: "call",
      },
      {
        id: "BET_33",
        label: "Bet 33% (3.0 bb)",
        sublabel: "+3.65 bb EV",
        frequencyPct: 0,
        evBb: 3.65,
        color: "raise",
      },
      {
        id: "OVERBET_125",
        label: "Overbet 125% (11.4 bb)",
        sublabel: "+4.45 bb EV (GTO)",
        frequencyPct: 95,
        evBb: 4.45,
        color: "overbet",
      },
    ],
    coachExplanation:
      "El 2♥ en el Turn es una carta blanca total. Como el rango de la BB está capado (no tiene AA, KK ni AK), GTO polariza el Turn usando Overbet 125% con AQ+, dobles parejas, sets y proyectos broadway (QJ, JT) para presionar al máximo los Ax débiles y Kx de la BB.",
  },
];

const SUIT_CARD_STYLE: Record<
  "s" | "h" | "d" | "c",
  { symbol: string; bg: string; border: string; text: string }
> = {
  s: { symbol: "♠", bg: "bg-slate-800", border: "border-slate-500", text: "text-white" },
  h: { symbol: "♥", bg: "bg-rose-950", border: "border-rose-500", text: "text-rose-400" },
  d: { symbol: "♦", bg: "bg-sky-950", border: "border-sky-500", text: "text-sky-400" },
  c: {
    symbol: "♣",
    bg: "bg-emerald-950",
    border: "border-emerald-500",
    text: "text-emerald-400",
  },
};

export default function StudyRoomTrainer() {
  const [filterMode, setFilterMode] = useState<"ALL" | "PT4_LEAKS" | "PREFLOP" | "POSTFLOP">(
    "ALL"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    handsPlayed: 0,
    optimalHits: 0,
    streak: 0,
    evSavedBb: 0,
  });

  const filteredDrills = STUDY_DRILLS.filter((d) => {
    if (filterMode === "PT4_LEAKS") return d.isPt4LeakDrill;
    if (filterMode === "PREFLOP") return d.mode === "PREFLOP";
    if (filterMode === "POSTFLOP") return d.mode === "POSTFLOP";
    return true;
  });

  const activeDrill =
    filteredDrills[currentIndex % filteredDrills.length] || STUDY_DRILLS[0];

  const chosenOption = activeDrill.options.find((o) => o.id === selectedOptionId);
  const bestOption = [...activeDrill.options].sort(
    (a, b) => b.frequencyPct - a.frequencyPct
  )[0];

  function handleSelectOption(optionId: string) {
    if (selectedOptionId) return; // already answered
    setSelectedOptionId(optionId);

    const opt = activeDrill.options.find((o) => o.id === optionId);
    if (!opt) return;

    const isOptimal = opt.frequencyPct >= 50;
    const isAcceptable = opt.frequencyPct >= 10 && opt.frequencyPct < 50;

    setSessionStats((prev) => ({
      handsPlayed: prev.handsPlayed + 1,
      optimalHits: prev.optimalHits + (isOptimal || isAcceptable ? 1 : 0),
      streak: isOptimal || isAcceptable ? prev.streak + 1 : 0,
      evSavedBb: Number((prev.evSavedBb + Math.max(0, opt.evBb)).toFixed(2)),
    }));
  }

  function handleNextHand() {
    setSelectedOptionId(null);
    setCurrentIndex((prev) => prev + 1);
  }

  const accuracyPct =
    sessionStats.handsPlayed > 0
      ? Math.round((sessionStats.optimalHits / sessionStats.handsPlayed) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Top Bar: Session Score & Mode Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "ALL", label: "Todos los Spots" },
              { id: "PT4_LEAKS", label: "Entrenar Mis Leaks PT4" },
              { id: "PREFLOP", label: "Solo Preflop" },
              { id: "POSTFLOP", label: "Solo Postflop" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setFilterMode(m.id);
                setCurrentIndex(0);
                setSelectedOptionId(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filterMode === m.id
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {m.id === "PT4_LEAKS" && <Sparkles className="w-3.5 h-3.5" />}
              {m.label}
            </button>
          ))}
        </div>

        {/* Live Session Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Precisión GTO:</span>
            <span className="text-white font-black">{accuracyPct}%</span>
            <span className="text-slate-500">
              ({sessionStats.optimalHits}/{sessionStats.handsPlayed})
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <Flame className="w-4 h-4 text-rose-400" />
            <span className="text-slate-400">Racha:</span>
            <span className="text-rose-400 font-black">{sessionStats.streak}</span>
          </div>
          <button
            onClick={() => {
              setSessionStats({
                handsPlayed: 0,
                optimalHits: 0,
                streak: 0,
                evSavedBb: 0,
              });
              setSelectedOptionId(null);
            }}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            title="Reiniciar sesión"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Trainer Grid: Felt Table + Coach Feedback */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Interactive 6-Max Poker Table Simulator */}
        <div className="xl:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          {/* Drill Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {activeDrill.mode}
              </span>
              {activeDrill.isPt4LeakDrill && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Corrector de Leak PT4
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Spot #{(currentIndex % filteredDrills.length) + 1} de{" "}
              {filteredDrills.length}
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-white mb-1">
            {activeDrill.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mb-6">
            {activeDrill.situationText}
          </p>

          {/* 6-Max Felt Visualization */}
          <div className="relative my-2 py-8 px-4 rounded-[48px] bg-gradient-to-b from-emerald-950/90 via-emerald-900/50 to-slate-950 border-4 border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[260px]">
            {/* Position Badges Around Table */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {(["UTG", "MP", "CO", "BTN", "SB", "BB"] as Position[]).map((pos) => {
                const isHero = pos === activeDrill.heroPos;
                const isVillain = pos === activeDrill.villainPos;
                return (
                  <div
                    key={pos}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      isHero
                        ? "bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/40 scale-105"
                        : isVillain
                        ? "bg-amber-500/20 text-amber-300 border-amber-400/50"
                        : "bg-slate-900/80 text-slate-500 border-slate-800"
                    }`}
                  >
                    {pos} {isHero ? "(HERO)" : isVillain ? "(VILLAIN)" : ""}
                  </div>
                );
              })}
            </div>

            {/* Pot Size Badge */}
            <div className="px-4 py-1 rounded-full bg-slate-950/90 border border-emerald-500/40 text-xs font-extrabold text-emerald-300 mb-4 shadow">
              Bote Actual: {activeDrill.potBb.toFixed(1)} bb
            </div>

            {/* Community Board Cards (if Postflop) */}
            {activeDrill.boardCards && activeDrill.boardCards.length > 0 && (
              <div className="flex items-center gap-2 mb-5">
                {activeDrill.boardCards.map((c, idx) => {
                  const st = SUIT_CARD_STYLE[c.suit];
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-16 sm:w-14 sm:h-20 rounded-xl border-2 ${st.bg} ${st.border} flex flex-col items-center justify-center shadow-lg`}
                    >
                      <span className="text-lg sm:text-xl font-black text-white leading-none">
                        {c.rank}
                      </span>
                      <span className={`text-lg sm:text-xl leading-none mt-1 ${st.text}`}>
                        {st.symbol}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hero Hole Cards */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2.5">
                {activeDrill.heroCards.map((c, idx) => {
                  const st = SUIT_CARD_STYLE[c.suit];
                  return (
                    <div
                      key={idx}
                      className={`w-16 h-22 sm:w-18 sm:h-24 py-3 rounded-2xl border-2 ${st.bg} ${st.border} flex flex-col items-center justify-center shadow-xl ring-2 ring-white/10`}
                    >
                      <span className="text-2xl font-black text-white leading-none">
                        {c.rank}
                      </span>
                      <span className={`text-2xl leading-none mt-1 ${st.text}`}>
                        {st.symbol}
                      </span>
                    </div>
                  );
                })}
              </div>
              <span className="mt-2 text-xs font-extrabold text-white bg-slate-950/90 px-3 py-0.5 rounded-full border border-slate-700">
                Hero ({activeDrill.heroPos}): {activeDrill.handNotation} · 100 bb
              </span>
            </div>
          </div>

          {/* Decision Action Buttons */}
          <div className="mt-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              ¿Cuál es la acción óptima en este spot?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeDrill.options.map((opt) => {
                const isPicked = selectedOptionId === opt.id;
                const showResult = selectedOptionId !== null;

                let btnStyle =
                  "bg-slate-950 border-slate-800 hover:border-slate-600 text-white";
                if (opt.color === "fold") {
                  btnStyle =
                    "bg-slate-950 border-slate-700 hover:bg-slate-800 text-slate-200";
                } else if (opt.color === "call") {
                  btnStyle =
                    "bg-emerald-950/70 border-emerald-600/60 hover:bg-emerald-900/80 text-emerald-100";
                } else if (opt.color === "raise") {
                  btnStyle =
                    "bg-rose-950/70 border-rose-600/60 hover:bg-rose-900/80 text-rose-100";
                } else if (opt.color === "overbet") {
                  btnStyle =
                    "bg-purple-950/70 border-purple-600/60 hover:bg-purple-900/80 text-purple-100";
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={showResult}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${btnStyle} ${
                      isPicked ? "ring-2 ring-white scale-[1.02]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-black">{opt.label}</span>
                      {showResult && (
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                            opt.frequencyPct >= 50
                              ? "bg-emerald-500 text-slate-950"
                              : opt.frequencyPct > 0
                              ? "bg-amber-400 text-slate-950"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {opt.frequencyPct}%
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {showResult ? opt.sublabel : "Haz clic para elegir"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Instant GTO Evaluation & Coach Explanation */}
        <div className="xl:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          {!selectedOptionId ? (
            <div className="my-auto text-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-7 h-7 text-rose-400" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">
                Selecciona tu Acción en la Mesa
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Toma tu decisión como si estuvieras en tus mesas de Cash 6-Max. Al
                responder verás las frecuencias exactas del solver, el EV en bb y la
                explicación estratégica del coach.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Verdict Banner */}
              {chosenOption && chosenOption.frequencyPct >= 50 ? (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-black text-emerald-300 block">
                      ¡Decisión GTO Óptima! ({chosenOption.label})
                    </span>
                    <span className="text-xs text-emerald-200">
                      Jugada principal del solver ({chosenOption.frequencyPct}% de
                      frecuencia · {chosenOption.sublabel}).
                    </span>
                  </div>
                </div>
              ) : chosenOption && chosenOption.frequencyPct >= 5 ? (
                <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-black text-amber-300 block">
                      Frecuencia Mixta Secundaria ({chosenOption.label})
                    </span>
                    <span className="text-xs text-amber-200">
                      El solver la utiliza un {chosenOption.frequencyPct}% del tiempo,
                      pero prefiere <strong>{bestOption.label}</strong> (
                      {bestOption.frequencyPct}%).
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-black text-rose-300 block">
                      Error / Leak de EV ({chosenOption?.label})
                    </span>
                    <span className="text-xs text-rose-200">
                      Esta línea tiene 0% de frecuencia en GTO. La acción óptima es{" "}
                      <strong>{bestOption.label}</strong> ({bestOption.frequencyPct}%).
                    </span>
                  </div>
                </div>
              )}

              {/* Frequency Breakdown Bars */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Distribución GTO del Spot ({activeDrill.handNotation})
                </span>
                {activeDrill.options.map((opt) => (
                  <div key={opt.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white">{opt.label}</span>
                      <span className="text-slate-400">
                        {opt.frequencyPct}% · {opt.sublabel}
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${opt.frequencyPct}%` }}
                        className={`h-full ${
                          opt.frequencyPct >= 50
                            ? "bg-emerald-500"
                            : opt.frequencyPct > 0
                            ? "bg-amber-400"
                            : "bg-slate-800"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Coach Explanation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1.5">
                  Explicación del Coach
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {activeDrill.coachExplanation}
                </p>
              </div>

              <button
                onClick={handleNextHand}
                className="w-full py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Siguiente Mano de Entrenamiento</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
