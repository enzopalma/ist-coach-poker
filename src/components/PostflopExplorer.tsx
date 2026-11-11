"use client";

import React, { useState } from "react";
import { POSTFLOP_STRATEGIES, PostflopSpotStrategy } from "@/data/postflopStrategies";
import {
  Flame,
  ShieldAlert,
  TrendingUp,
  Layers,
  ArrowRight,
  Compass,
} from "lucide-react";

interface PostflopExplorerProps {
  initialSpotId?: string;
}

const SUIT_STYLES: Record<
  "s" | "h" | "d" | "c",
  { symbol: string; bg: string; border: string; text: string }
> = {
  s: {
    symbol: "♠",
    bg: "bg-slate-800",
    border: "border-slate-600",
    text: "text-slate-100",
  },
  h: {
    symbol: "♥",
    bg: "bg-rose-950/90",
    border: "border-rose-600/70",
    text: "text-rose-400",
  },
  d: {
    symbol: "♦",
    bg: "bg-sky-950/90",
    border: "border-sky-600/70",
    text: "text-sky-400",
  },
  c: {
    symbol: "♣",
    bg: "bg-emerald-950/90",
    border: "border-emerald-600/70",
    text: "text-emerald-400",
  },
};

export default function PostflopExplorer({ initialSpotId }: PostflopExplorerProps) {
  const [selectedSpotId, setSelectedSpotId] = useState<string>(
    initialSpotId || POSTFLOP_STRATEGIES[0].id
  );
  const [activeStreet, setActiveStreet] = useState<"FLOP" | "TURN" | "RIVER">("FLOP");

  const spot: PostflopSpotStrategy =
    POSTFLOP_STRATEGIES.find((s) => s.id === selectedSpotId) ||
    POSTFLOP_STRATEGIES[0];

  const streetPlan = spot.streets[activeStreet];

  return (
    <div className="space-y-6">
      {/* Spot Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {POSTFLOP_STRATEGIES.map((item) => {
          const isSelected = item.id === spot.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedSpotId(item.id);
                setActiveStreet("FLOP");
              }}
              className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 border-slate-600"
                  : "bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {item.potType.replace("_", " ")}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    SPR {item.spr}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white mb-1">{item.spotName}</h4>
                <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                  {item.textureTag}
                </p>
              </div>

              {/* Mini Board Cards */}
              <div className="flex items-center gap-1.5">
                {item.boardCards.map((c, idx) => {
                  const st = SUIT_STYLES[c.suit];
                  return (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-lg border text-xs font-semibold flex items-center gap-0.5 ${st.bg} ${st.border} ${st.text}`}
                    >
                      {c.rank}
                      <span>{st.symbol}</span>
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Board & Street Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-4">
            {/* Large 4-color Board Cards */}
            <div className="flex items-center gap-2">
              {spot.boardCards.map((c, i) => {
                const st = SUIT_STYLES[c.suit];
                return (
                  <div
                    key={i}
                    className={`w-14 h-20 rounded-xl border-2 ${st.bg} ${st.border} flex flex-col items-center justify-center`}
                  >
                    <span className="text-xl font-semibold text-white leading-none">
                      {c.rank}
                    </span>
                    <span className={`text-xl leading-none mt-1 ${st.text}`}>
                      {st.symbol}
                    </span>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300 border border-slate-700">
                  {spot.positions}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                  Bote Inicial: {spot.potSizeBb} bb · SPR {spot.spr}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {streetPlan.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{spot.textureTag}</p>
            </div>
          </div>

          {/* Street Selector Tabs (Flop -> Turn -> River) */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start lg:self-center">
            {(["FLOP", "TURN", "RIVER"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setActiveStreet(st)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeStreet === st
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Global Action Frequencies + Strategic Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-5 border-b border-slate-800">
          {/* Action Sizing Breakdown */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Frecuencias Globales en {activeStreet}
              </span>
              <span className="text-xs font-medium text-emerald-400">
                Tamaño Principal: {streetPlan.preferredSizing}
              </span>
            </div>

            {/* Combined Bar */}
            <div className="w-full h-7 rounded-xl overflow-hidden flex bg-slate-950 border border-slate-800">
              {streetPlan.globalFrequencies.overbet125 > 0 && (
                <div
                  style={{ width: `${streetPlan.globalFrequencies.overbet125}%` }}
                  className="bg-purple-600 text-[10px] font-semibold text-white flex items-center justify-center"
                  title="Overbet 125%"
                >
                  OB {streetPlan.globalFrequencies.overbet125}%
                </div>
              )}
              {streetPlan.globalFrequencies.bet75 > 0 && (
                <div
                  style={{ width: `${streetPlan.globalFrequencies.bet75}%` }}
                  className="bg-rose-600 text-[10px] font-semibold text-white flex items-center justify-center"
                  title="Bet 66-75%"
                >
                  75% ({streetPlan.globalFrequencies.bet75}%)
                </div>
              )}
              {streetPlan.globalFrequencies.bet33 > 0 && (
                <div
                  style={{ width: `${streetPlan.globalFrequencies.bet33}%` }}
                  className="bg-amber-500 text-[10px] font-semibold text-slate-950 flex items-center justify-center"
                  title="Bet 33%"
                >
                  33% ({streetPlan.globalFrequencies.bet33}%)
                </div>
              )}
              {streetPlan.globalFrequencies.check > 0 && (
                <div
                  style={{ width: `${streetPlan.globalFrequencies.check}%` }}
                  className="bg-emerald-600 text-[10px] font-semibold text-white flex items-center justify-center"
                  title="Check"
                >
                  Check {streetPlan.globalFrequencies.check}%
                </div>
              )}
            </div>

            {/* Legend Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-emerald-400 font-medium block">
                  CHECK
                </span>
                <span className="text-sm font-semibold text-white">
                  {streetPlan.globalFrequencies.check}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-amber-400 font-medium block">
                  BET 33% (CHICO)
                </span>
                <span className="text-sm font-semibold text-white">
                  {streetPlan.globalFrequencies.bet33}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-rose-400 font-medium block">
                  BET 66-75%
                </span>
                <span className="text-sm font-semibold text-white">
                  {streetPlan.globalFrequencies.bet75}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-[10px] text-purple-400 font-medium block">
                  OVERBET 125%
                </span>
                <span className="text-sm font-semibold text-white">
                  {streetPlan.globalFrequencies.overbet125}%
                </span>
              </div>
            </div>
          </div>

          {/* Coach Explanation & PT4 Leak Warning */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-medium text-rose-400 mb-1.5">
                <Compass className="w-4 h-4" />
                Lógica GTO en {activeStreet} ({spot.boardLabel})
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {streetPlan.strategicSummary}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-slate-700 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200 leading-relaxed">
                <strong className="text-amber-300">Alerta de Leak en PT4: </strong>
                {spot.pt4LeakWarning}
              </p>
            </div>
          </div>
        </div>

        {/* Hand Categories Postflop Table */}
        <div className="pt-5">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            Cómo Jugar Cada Categoría de Mano en {activeStreet}
          </h4>

          <div className="space-y-3">
            {streetPlan.handCategories.map((cat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Category Name & Examples */}
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {cat.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {cat.comboSharePct}% del rango
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-mono mt-0.5">
                      Ej: {cat.examples}
                    </p>
                  </div>

                  {/* Proportional Action Bar */}
                  <div className="lg:col-span-4">
                    <div className="w-full h-6 rounded-lg overflow-hidden flex bg-slate-900 border border-slate-800">
                      {cat.overbetPct > 0 && (
                        <div
                          style={{ width: `${cat.overbetPct}%` }}
                          className="bg-purple-600 text-[10px] font-medium text-white flex items-center justify-center"
                        >
                          {cat.overbetPct >= 12 ? `OB ${cat.overbetPct}%` : ""}
                        </div>
                      )}
                      {cat.betBigPct > 0 && (
                        <div
                          style={{ width: `${cat.betBigPct}%` }}
                          className="bg-rose-600 text-[10px] font-medium text-white flex items-center justify-center"
                        >
                          {cat.betBigPct >= 12 ? `75% (${cat.betBigPct}%)` : ""}
                        </div>
                      )}
                      {cat.betSmallPct > 0 && (
                        <div
                          style={{ width: `${cat.betSmallPct}%` }}
                          className="bg-amber-500 text-[10px] font-medium text-slate-950 flex items-center justify-center"
                        >
                          {cat.betSmallPct >= 12 ? `33% (${cat.betSmallPct}%)` : ""}
                        </div>
                      )}
                      {cat.checkPct > 0 && (
                        <div
                          style={{ width: `${cat.checkPct}%` }}
                          className="bg-emerald-600 text-[10px] font-medium text-white flex items-center justify-center"
                        >
                          {cat.checkPct >= 12 ? `Chk ${cat.checkPct}%` : ""}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tactical Explanation */}
                  <div className="lg:col-span-4 text-xs text-slate-300 leading-relaxed">
                    {cat.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Turn/River Runout Guide */}
        {streetPlan.turnRiverRunouts && streetPlan.turnRiverRunouts.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Guía de Runouts: Cómo Ajustar según la Carta que Caiga
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {streetPlan.turnRiverRunouts.map((runout, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-medium text-white">
                        {runout.cardType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-slate-700">
                        {runout.recommendedSizing}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-amber-300 mb-2">
                      Cartas: {runout.exampleCards}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {runout.strategyAdjustment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
