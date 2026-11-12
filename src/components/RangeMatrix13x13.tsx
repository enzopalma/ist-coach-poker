"use client";

import React, { useState } from "react";
import {
  RANKS,
  getHandLabel,
  getHandCombos,
  PreflopScenario,
  HandFrequencies,
} from "@/data/pokerRanges";
import { Sparkles, AlertTriangle, CheckCircle2, Info, Layers } from "lucide-react";

interface RangeMatrix13x13Props {
  scenario: PreflopScenario;
}

type MatrixViewMode = "GTO" | "PT4_HERO" | "DIFF";
type HandFilter = "ALL" | "PAIRS" | "SUITED" | "OFFSUIT" | "MIXED" | "LEAKS";

export default function RangeMatrix13x13({ scenario }: RangeMatrix13x13Props) {
  const [viewMode, setViewMode] = useState<MatrixViewMode>("GTO");
  const [filter, setFilter] = useState<HandFilter>("ALL");
  const [selectedHand, setSelectedHand] = useState<string>("A5s");

  const activeGto = scenario.frequencies[selectedHand] || {
    raise: 0,
    call: 0,
    fold: 100,
  };
  const activeHero = scenario.pt4HeroFrequencies[selectedHand] || {
    raise: 0,
    call: 0,
    fold: 100,
  };

  const raiseLabel =
    scenario.category === "RFI"
      ? `Open Raise (${scenario.sizing})`
      : scenario.category === "VS_OPEN"
      ? `3-Bet (${scenario.sizing.replace("3-Bet a ", "")})`
      : `4-Bet (23.5 bb)`;

  function matchesFilter(hand: string, gto: HandFrequencies, hero: HandFrequencies): boolean {
    if (filter === "ALL") return true;
    if (filter === "PAIRS") return hand.length === 2;
    if (filter === "SUITED") return hand.endsWith("s");
    if (filter === "OFFSUIT") return hand.endsWith("o");
    if (filter === "MIXED") {
      return (gto.raise > 0 && gto.raise < 100) || (gto.call > 0 && gto.call < 100);
    }
    if (filter === "LEAKS") {
      const diffRaise = Math.abs(gto.raise - hero.raise);
      const diffCall = Math.abs(gto.call - hero.call);
      return diffRaise >= 20 || diffCall >= 20;
    }
    return true;
  }

  const selectedDiffRaise = activeHero.raise - activeGto.raise;
  const selectedDiffCall = activeHero.call - activeGto.call;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left / Center: 13x13 Interactive Matrix */}
      <div className="xl:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
        {/* Top Controls: View Mode & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("GTO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "GTO"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Rango de referencia
            </button>
            <button
              onClick={() => setViewMode("PT4_HERO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "PT4_HERO"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Mi Rango PT4
            </button>
            <button
              onClick={() => setViewMode("DIFF")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "DIFF"
                  ? "bg-amber-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Comparar con mi PT4 (simulado)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "ALL", label: "Todas" },
                { id: "PAIRS", label: "Pares" },
                { id: "SUITED", label: "Suited" },
                { id: "OFFSUIT", label: "Offsuit" },
                { id: "MIXED", label: "Mixtas" },
                { id: "LEAKS", label: "Leaks PT4" },
              ] as { id: HandFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  filter === f.id
                    ? "bg-slate-800 text-white border-slate-600"
                    : "bg-slate-950/60 text-slate-400 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Legend & Global Range Percentages */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block" />
              <span className="text-slate-300 font-medium">{raiseLabel}:</span>
              <span className="text-white font-medium">{scenario.gtoSummary.raisePct}%</span>
            </div>
            {scenario.gtoSummary.callPct > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" />
                <span className="text-slate-300 font-medium">Call / Flat:</span>
                <span className="text-white font-medium">{scenario.gtoSummary.callPct}%</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700 inline-block" />
              <span className="text-slate-400">Fold:</span>
              <span className="text-slate-300 font-semibold">{scenario.gtoSummary.foldPct}%</span>
            </div>
          </div>
          <div className="text-slate-400 font-medium">
            Combos activos:{" "}
            <span className="text-emerald-400 font-medium">
              {scenario.gtoSummary.totalCombosPlayed}
            </span>{" "}
            / 1,326
          </div>
        </div>

        {/* 13x13 Grid */}
        <div className="grid grid-cols-13 gap-1 select-none">
          {RANKS.map((_, rowIdx) =>
            RANKS.map((__, colIdx) => {
              const hand = getHandLabel(rowIdx, colIdx);
              const gto = scenario.frequencies[hand] || { raise: 0, call: 0, fold: 100 };
              const hero = scenario.pt4HeroFrequencies[hand] || {
                raise: 0,
                call: 0,
                fold: 100,
              };
              const source = viewMode === "PT4_HERO" ? hero : gto;
              const isSelected = selectedHand === hand;
              const isVisible = matchesFilter(hand, gto, hero);

              const diffRaise = Math.abs(gto.raise - hero.raise);
              const diffCall = Math.abs(gto.call - hero.call);
              const hasDeviation = diffRaise >= 20 || diffCall >= 20;

              const isPair = rowIdx === colIdx;

              return (
                <button
                  key={hand}
                  type="button"
                  onClick={() => setSelectedHand(hand)}
                  onMouseEnter={() => setSelectedHand(hand)}
                  className={`relative h-10 sm:h-12 rounded-md overflow-hidden border transition-all flex flex-col justify-between p-1 text-left ${
                    !isVisible ? "opacity-20 grayscale" : "opacity-100"
                  } ${
                    isSelected
                      ? "ring-2 ring-white border-white z-10 scale-[1.04]"
                      : viewMode === "DIFF" && hasDeviation
                      ? "border-amber-400/90"
                      : isPair
                      ? "border-slate-600/80"
                      : "border-slate-800/90"
                  }`}
                  style={{
                    background: `linear-gradient(to right, 
                      #f43f5e 0%, 
                      #f43f5e ${source.raise}%, 
                      #10b981 ${source.raise}%, 
                      #10b981 ${source.raise + source.call}%, 
                      #0f172a ${source.raise + source.call}%, 
                      #0f172a 100%)`,
                  }}
                >
                  <div className="flex items-center justify-between w-full z-10">
                    <span
                      className={`text-[10px] sm:text-xs font-medium leading-none ${
                        source.raise + source.call > 15
                          ? "text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {hand}
                    </span>
                    {viewMode === "DIFF" && hasDeviation && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>

                  {/* Bottom mini frequency bar / label */}
                  <div className="w-full flex items-center justify-between z-10">
                    {viewMode === "DIFF" && hasDeviation ? (
                      <span className="text-[9px] font-semibold text-amber-300 bg-slate-950/85 px-1 rounded leading-tight">
                        {hero.raise - gto.raise !== 0
                          ? `${hero.raise - gto.raise > 0 ? "+" : ""}${
                              hero.raise - gto.raise
                            }% R`
                          : `${hero.call - gto.call > 0 ? "+" : ""}${
                              hero.call - gto.call
                            }% C`}
                      </span>
                    ) : source.raise + source.call > 0 &&
                      source.raise + source.call < 100 ? (
                      <span className="text-[9px] font-semibold text-slate-100/90 bg-slate-950/60 px-1 rounded leading-tight">
                        {source.raise > 0 ? `${source.raise}%` : `${source.call}%`}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Hand Inspector & Coach Notes */}
      <div className="xl:col-span-4 flex flex-col gap-5">
        {/* Hand Inspector Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold">
                Inspector de Mano Seleccionada
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-semibold text-white ">
                  {selectedHand}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {getHandCombos(selectedHand)} combos (
                  {selectedHand.length === 2
                    ? "Pocket Pair"
                    : selectedHand.endsWith("s")
                    ? "Suited"
                    : "Offsuit"}
                  )
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Posición</span>
              <span className="text-sm font-medium text-emerald-400">
                {scenario.heroPos}
                {scenario.villainPos ? ` vs ${scenario.villainPos}` : " (RFI)"}
              </span>
            </div>
          </div>

          {/* GTO Frequency Breakdown */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Referencia</span>
                <span className="text-slate-400">
                  {activeGto.raise}% Raise · {activeGto.call}% Call · {activeGto.fold}% Fold
                </span>
              </div>
              <div className="w-full h-5 rounded-lg overflow-hidden flex bg-slate-950 border border-slate-800">
                {activeGto.raise > 0 && (
                  <div
                    style={{ width: `${activeGto.raise}%` }}
                    className="bg-rose-500 text-[10px] font-medium text-white flex items-center justify-center"
                  >
                    {activeGto.raise >= 15 ? `R ${activeGto.raise}%` : ""}
                  </div>
                )}
                {activeGto.call > 0 && (
                  <div
                    style={{ width: `${activeGto.call}%` }}
                    className="bg-emerald-500 text-[10px] font-medium text-slate-950 flex items-center justify-center"
                  >
                    {activeGto.call >= 15 ? `C ${activeGto.call}%` : ""}
                  </div>
                )}
                {activeGto.fold > 0 && (
                  <div
                    style={{ width: `${activeGto.fold}%` }}
                    className="bg-slate-800 text-[10px] font-medium text-slate-400 flex items-center justify-center"
                  >
                    {activeGto.fold >= 15 ? `F ${activeGto.fold}%` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* PT4 Hero Comparison Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-300">Tu Frecuencia en PT4</span>
                <span className="text-slate-400">
                  {activeHero.raise}% Raise · {activeHero.call}% Call · {activeHero.fold}% Fold
                </span>
              </div>
              <div className="w-full h-5 rounded-lg overflow-hidden flex bg-slate-950 border border-slate-800">
                {activeHero.raise > 0 && (
                  <div
                    style={{ width: `${activeHero.raise}%` }}
                    className="bg-rose-500/80 text-[10px] font-medium text-white flex items-center justify-center"
                  >
                    {activeHero.raise >= 15 ? `R ${activeHero.raise}%` : ""}
                  </div>
                )}
                {activeHero.call > 0 && (
                  <div
                    style={{ width: `${activeHero.call}%` }}
                    className="bg-emerald-500/80 text-[10px] font-medium text-slate-950 flex items-center justify-center"
                  >
                    {activeHero.call >= 15 ? `C ${activeHero.call}%` : ""}
                  </div>
                )}
                {activeHero.fold > 0 && (
                  <div
                    style={{ width: `${activeHero.fold}%` }}
                    className="bg-slate-800 text-[10px] font-medium text-slate-400 flex items-center justify-center"
                  >
                    {activeHero.fold >= 15 ? `F ${activeHero.fold}%` : ""}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic Pill for Selected Hand */}
          {Math.abs(selectedDiffRaise) >= 15 || Math.abs(selectedDiffCall) >= 15 ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-slate-700 flex items-start gap-2.5 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium block text-amber-300 mb-0.5">
                  Desviación detectada en {selectedHand}:
                </span>
                {selectedDiffRaise < -15
                  ? `Estás subiendo/3-beteando un ${Math.abs(
                      selectedDiffRaise
                    )}% menos que la referencia con ${selectedHand}. Aprovecha sus bloqueadores y equidad suited para presionar más.`
                  : selectedDiffCall > 15
                  ? `Estás pagando un +${selectedDiffCall}% de más con ${selectedHand}. Evita pagar con manos dominadas o sin iniciativa.`
                  : `Tu frecuencia difiere de la referencia. Ajusta hacia ${activeGto.raise}% Raise / ${activeGto.call}% Call.`}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-slate-700 flex items-center gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Tu frecuencia en PT4 con <strong>{selectedHand}</strong> está bien
                calibrada respecto a la referencia.
              </span>
            </div>
          )}
        </div>

        {/* Coach Notes & Tactical Adjustments */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <Info className="w-4 h-4 text-rose-400" />
            Claves Estratégicas del Spot ({scenario.shortTitle})
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            {scenario.coachNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{note}</span>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-amber-300 font-medium text-xs mb-2">
              <Layers className="w-4 h-4" />
              Ajustes Explotativos según rivales en PT4
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              {scenario.keyAdjustments.map((adj, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{adj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
