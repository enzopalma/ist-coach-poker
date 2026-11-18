"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface AnalyzedHand {
  id: string;
  handNumber: string;
  spotTitle: string; // ej: "BTN vs BB · 3-Bet Pot OOP"
  heroCards: string; // ej: "As Kd"
  board: string; // ej: "Ks 8c 4d - 2s - Jh"
  potType: "ROLLEADO" | "3BET_IP" | "3BET_OOP" | "SRP_IP" | "SRP_OOP" | "4BET" | "OTRO";
  resultBb: number; // ej: -45 o +80

  // Paso 1: Lo jugado en caliente
  playedPreflop: string;
  playedPostflop: string;
  inGameThought: string; // "Pensé que el rival tenía busted draws..."

  // Paso 2: Análisis en frío (Solver / Coach)
  optimalLine: string; // "Línea óptima: Check-fold river"
  villainRangeRead: string; // "El rival en micro-límites casi no farolea river..."
  learnedRule: string; // "Regla: No pagar river en botes 3-bet OOP sin blocker de color"

  rawHandHistory?: string;
  date: string;
}

const STORAGE_KEY = "ist-coach-analyzed-hands-v2";

const INITIAL_DEMO: AnalyzedHand[] = [
  {
    id: "hand-demo-1",
    handNumber: "#249104812",
    spotTitle: "BB vs BTN · 3-Bet Pot OOP",
    heroCards: "Qh Qd",
    board: "Ts 8s 3c - 6c - 2s",
    potType: "3BET_OOP",
    resultBb: -75,
    playedPreflop: "Hero 3-bet desde BB a 11bb vs open BTN 2.5bb. BTN paga.",
    playedPostflop: "Hero c-bet 1/3 (8bb), BTN paga. Turn 6c check-check. River 2s Hero check, BTN shovea 75bb. Hero paga con QQ.",
    inGameThought: "Pensé que BTN podía estar faroleando picas fallidas o J9/97 que no conectaron.",
    optimalLine: "Check-fold River ante Shove de 75bb.",
    villainRangeRead: "El rival solo shovea color completado (AsXs, KsXs) o sets flopeados (TT/88). Su frecuencia de farol en river en este spot es menor al 8%.",
    learnedRule: "En botes 3-bet OOP, no pagar overbets/shoves en river en cartas que completan color sin el As de picas como blocker.",
    date: "Hoy 14:15",
  },
  {
    id: "hand-demo-2",
    handNumber: "#249105300",
    spotTitle: "CO Iso-Raise vs 2 Limpers",
    heroCards: "Ad Jc",
    board: "Jd 9h 4c - 8s - 2c",
    potType: "ROLLEADO",
    resultBb: +42,
    playedPreflop: "2 limpers en UTG y MP. Hero rollea a 5bb en CO. Paga UTG.",
    playedPostflop: "Flop Hero c-bet 60% pot, UTG paga. Turn 8s Hero apuesta 75% pot por valor, UTG paga. River 2c Hero apuesta 65% pot, UTG paga con J8o.",
    inGameThought: "El recreacional paga con cualquier Jx débil y proyectos. Extraje 3 calles de valor.",
    optimalLine: "Línea correcta ejecutada: triple barrel de valor vs recreacional con top pair buen kicker.",
    villainRangeRead: "Rango de limp-call muy amplio y pasivo. Rara vez resuben de farol.",
    learnedRule: "En pozos rolleados con ventaja de rango y posición, no cortar la agresión en river si el recreacional paga con parejas peores.",
    date: "Ayer 19:30",
  },
];

const POT_TYPE_LABELS = {
  ROLLEADO: "Pozo Rolleado",
  "3BET_IP": "3-Bet Pot IP",
  "3BET_OOP": "3-Bet Pot OOP",
  SRP_IP: "SRP en Posición",
  SRP_OOP: "SRP Fuera de Posición",
  "4BET": "4-Bet Pot",
  OTRO: "General",
};

export default function HandAnalysisLab() {
  const [hands, setHands] = useState<AnalyzedHand[]>(INITIAL_DEMO);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHandId, setSelectedHandId] = useState<string | null>(INITIAL_DEMO[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Formulario de nueva mano
  const [handNumber, setHandNumber] = useState("");
  const [spotTitle, setSpotTitle] = useState("");
  const [heroCards, setHeroCards] = useState("");
  const [board, setBoard] = useState("");
  const [potType, setPotType] = useState<AnalyzedHand["potType"]>("3BET_OOP");
  const [resultBb, setResultBb] = useState<number | "">("");
  const [rawHandHistory, setRawHandHistory] = useState("");

  const [playedPreflop, setPlayedPreflop] = useState("");
  const [playedPostflop, setPlayedPostflop] = useState("");
  const [inGameThought, setInGameThought] = useState("");

  const [optimalLine, setOptimalLine] = useState("");
  const [villainRangeRead, setVillainRangeRead] = useState("");
  const [learnedRule, setLearnedRule] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHands(parsed);
          setSelectedHandId(parsed[0].id);
        }
      }
    } catch {
      // Ignorar
    }
  }, []);

  function saveHands(newHands: AnalyzedHand[]) {
    setHands(newHands);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHands));
    } catch {
      // Ignorar
    }
  }

  function handleCreateHand(e: React.FormEvent) {
    e.preventDefault();
    if (!spotTitle.trim()) return;

    const newHand: AnalyzedHand = {
      id: `hand-analysis-${Date.now()}`,
      handNumber: handNumber.trim() || `#PT4-${Math.floor(Math.random() * 900000 + 100000)}`,
      spotTitle: spotTitle.trim(),
      heroCards: heroCards.trim() || "N/A",
      board: board.trim() || "N/A",
      potType,
      resultBb: typeof resultBb === "number" ? resultBb : 0,
      playedPreflop: playedPreflop.trim(),
      playedPostflop: playedPostflop.trim(),
      inGameThought: inGameThought.trim(),
      optimalLine: optimalLine.trim(),
      villainRangeRead: villainRangeRead.trim(),
      learnedRule: learnedRule.trim(),
      rawHandHistory: rawHandHistory.trim(),
      date: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
    };

    const next = [newHand, ...hands];
    saveHands(next);
    setSelectedHandId(newHand.id);
    setIsFormOpen(false);

    // Reset fields
    setHandNumber("");
    setSpotTitle("");
    setHeroCards("");
    setBoard("");
    setResultBb("");
    setRawHandHistory("");
    setPlayedPreflop("");
    setPlayedPostflop("");
    setInGameThought("");
    setOptimalLine("");
    setVillainRangeRead("");
    setLearnedRule("");
  }

  function handleDelete(id: string) {
    const next = hands.filter((h) => h.id !== id);
    saveHands(next);
    if (selectedHandId === id) {
      setSelectedHandId(next.length > 0 ? next[0].id : null);
    }
  }

  function copyConclusion(hand: AnalyzedHand) {
    const text = `[Análisis Mano ${hand.handNumber}] ${hand.spotTitle}\nCartas: ${hand.heroCards} | Board: ${hand.board} | Resultado: ${hand.resultBb > 0 ? "+" : ""}${hand.resultBb}bb\n\n- LO JUGADO:\nPreflop: ${hand.playedPreflop}\nPostflop: ${hand.playedPostflop}\nPensamiento en caliente: ${hand.inGameThought}\n\n- LO CONCLUIDO (ESTUDIO EN FRÍO):\nLínea Óptima: ${hand.optimalLine}\nLectura del Rival: ${hand.villainRangeRead}\n\n★ REGLA APRENDIDA: ${hand.learnedRule}`;
    navigator.clipboard.writeText(text);
    setCopiedId(hand.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const selectedHand = hands.find((h) => h.id === selectedHandId) || hands[0];

  const filteredHands = hands.filter(
    (h) =>
      h.spotTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.handNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.learnedRule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Laboratorio de Análisis de Manos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Trae las manos que marcaste en PokerTracker 4 para deconstruirlas en frío: compara lo jugado vs lo concluido y fija tus reglas de aprendizaje.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? "Cerrar Formulario" : "+ Analizar Nueva Mano"}</span>
        </button>
      </div>

      {/* Formulario de Análisis Paso a Paso (Acordeón Desplegable) */}
      {isFormOpen && (
        <form
          onSubmit={handleCreateHand}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6"
        >
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">
                Ficha de Análisis: Lo Jugado vs Lo Concluido
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Paso 1: Datos PT4 · Paso 2: Lo Jugado · Paso 3: Lo Concluido</span>
          </div>

          {/* Bloque 1: Datos Base de PT4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Spot / Situación *</label>
              <input
                type="text"
                required
                value={spotTitle}
                onChange={(e) => setSpotTitle(e.target.value)}
                placeholder="Ej. BTN vs BB · 3-Bet Pot OOP"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nº Mano en PT4</label>
              <input
                type="text"
                value={handNumber}
                onChange={(e) => setHandNumber(e.target.value)}
                placeholder="#249104812"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Tus Cartas (Hero)</label>
              <input
                type="text"
                value={heroCards}
                onChange={(e) => setHeroCards(e.target.value)}
                placeholder="Ej. Ah Kd o QQ"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Board Completo</label>
              <input
                type="text"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                placeholder="Ej. Ks 8c 4d - 2s - Jh"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Tipo de Pozo</label>
              <select
                value={potType}
                onChange={(e) => setPotType(e.target.value as AnalyzedHand["potType"])}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {Object.entries(POT_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Resultado en BBs</label>
              <input
                type="number"
                step="0.5"
                value={resultBb}
                onChange={(e) => setResultBb(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ej. -75 o +38"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bloque 2: Las 2 Columnas de Análisis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Columna A: Lo Jugado (Acción en la mesa) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                1. Lo Jugado en la Mesa (En caliente)
              </span>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Acción Preflop</label>
                <input
                  type="text"
                  value={playedPreflop}
                  onChange={(e) => setPlayedPreflop(e.target.value)}
                  placeholder="Ej. Open BTN 2.5bb, Hero 3-bet BB a 11bb, BTN paga."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Acción Postflop (Flop, Turn, River)</label>
                <textarea
                  rows={2}
                  value={playedPostflop}
                  onChange={(e) => setPlayedPostflop(e.target.value)}
                  placeholder="Ej. Flop c-bet 1/3, paga. Turn check-check. River Hero check, BTN shovea 75bb, Hero paga."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">¿Qué pensaste al tomar la decisión?</label>
                <textarea
                  rows={2}
                  value={inGameThought}
                  onChange={(e) => setInGameThought(e.target.value)}
                  placeholder="Ej. Creí que el rival podía estar convirtiendo una mano media en farol o bluffeando draws fallidos..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            {/* Columna B: Lo Concluido (Estudio en frío) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                2. Lo Concluido (Análisis en frío / Coach / Solver)
              </span>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Línea Óptima Real</label>
                <input
                  type="text"
                  value={optimalLine}
                  onChange={(e) => setOptimalLine(e.target.value)}
                  placeholder="Ej. Check-fold River ante el shove de 75bb."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Lectura de Rango del Rival</label>
                <textarea
                  rows={2}
                  value={villainRangeRead}
                  onChange={(e) => setVillainRangeRead(e.target.value)}
                  placeholder="Ej. El rival no tiene suficientes faroles naturales en su rango para justificar el call con bluffcatcher..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">★ Regla Aprendida para el Futuro</label>
                <textarea
                  rows={2}
                  value={learnedRule}
                  onChange={(e) => setLearnedRule(e.target.value)}
                  placeholder="Ej. En botes 3-bet OOP, nunca pagar shoves en river sin blocker de color o trips/set."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              Guardar Análisis de Mano
            </button>
          </div>
        </form>
      )}

      {/* Grid Principal: Lista a la izquierda (4 cols) y Visor de Deconstrucción a la derecha (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Listado de Manos Analizadas */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Manos Analizadas ({hands.length})
            </span>
          </div>

          {/* Buscador */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar spot o regla..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Lista de manos */}
          {filteredHands.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No hay manos que coincidan.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredHands.map((h) => {
                const isSelected = selectedHand && selectedHand.id === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHandId(h.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer text-left space-y-1 ${
                      isSelected
                        ? "bg-slate-800 border-indigo-500/80 shadow-sm"
                        : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate max-w-[170px]">
                        {h.spotTitle}
                      </span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          h.resultBb > 0
                            ? "text-emerald-400"
                            : h.resultBb < 0
                            ? "text-rose-400"
                            : "text-slate-400"
                        }`}
                      >
                        {h.resultBb > 0 ? `+${h.resultBb}` : h.resultBb} BB
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{h.heroCards}</span>
                      <span>{h.date}</span>
                    </div>

                    {h.learnedRule && (
                      <p className="text-[11px] text-slate-300 line-clamp-1 italic pt-0.5">
                        &quot;{h.learnedRule}&quot;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Deconstrucción Completa de la Mano Seleccionada */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          {selectedHand ? (
            <>
              {/* Encabezado de la Mano */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">
                      {selectedHand.spotTitle}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {POT_TYPE_LABELS[selectedHand.potType] || "General"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span>{selectedHand.handNumber}</span>
                    <span>·</span>
                    <span>Hero: <strong className="text-white">{selectedHand.heroCards}</strong></span>
                    <span>·</span>
                    <span>Board: <strong className="text-white">{selectedHand.board}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <span
                    className={`font-mono font-bold text-sm px-3 py-1 rounded-lg border ${
                      selectedHand.resultBb > 0
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : selectedHand.resultBb < 0
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {selectedHand.resultBb > 0 ? `+${selectedHand.resultBb}` : selectedHand.resultBb} BB
                  </span>

                  <button
                    onClick={() => copyConclusion(selectedHand)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copiar conclusión para Coach o Discord"
                  >
                    {copiedId === selectedHand.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(selectedHand.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Eliminar mano"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Comparador en 2 Bloques: Lo Jugado vs Lo Concluido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Lo Jugado */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Lo Jugado en la Mesa</span>
                  </div>

                  {selectedHand.playedPreflop && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Preflop:</span>
                      <p className="text-xs text-slate-200 mt-0.5">{selectedHand.playedPreflop}</p>
                    </div>
                  )}

                  {selectedHand.playedPostflop && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Postflop:</span>
                      <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{selectedHand.playedPostflop}</p>
                    </div>
                  )}

                  {selectedHand.inGameThought && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-400 block font-semibold">Pensamiento en caliente:</span>
                      <p className="text-xs text-slate-300 italic mt-0.5">&quot;{selectedHand.inGameThought}&quot;</p>
                    </div>
                  )}
                </div>

                {/* 2. Lo Concluido */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Lo Concluido (Estudio en Frío)</span>
                  </div>

                  {selectedHand.optimalLine && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Línea Óptima:</span>
                      <p className="text-xs text-emerald-300 font-semibold mt-0.5">{selectedHand.optimalLine}</p>
                    </div>
                  )}

                  {selectedHand.villainRangeRead && (
                    <div>
                      <span className="text-[11px] text-slate-400 block font-semibold">Lectura de Rango:</span>
                      <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{selectedHand.villainRangeRead}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Regla Aprendida Destacada */}
              {selectedHand.learnedRule && (
                <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>★ Conclusión & Regla Fija para el Futuro:</span>
                  </div>
                  <p className="text-sm font-medium text-emerald-200 leading-relaxed pl-6">
                    {selectedHand.learnedRule}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Selecciona una mano de la lista o crea un nuevo análisis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
