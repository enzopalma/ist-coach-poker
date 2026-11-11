"use client";

import React from "react";
import {
  Pt4DatabaseSummary,
  GTO_6MAX_TARGETS,
  analyzePt4Leaks,
} from "@/data/pt4Analytics";
import { Position } from "@/data/pokerRanges";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Database,
  ArrowUpRight,
  Flame,
  Target,
  BarChart3,
} from "lucide-react";

interface Pt4AnalyticsDashboardProps {
  dbSummary: Pt4DatabaseSummary;
  onOpenPreflopScenario: (scenarioId: string) => void;
  onOpenPostflopSpot: (spotId: string) => void;
  onOpenStudyRoom: () => void;
  onOpenDbModal: () => void;
}

export default function Pt4AnalyticsDashboard({
  dbSummary,
  onOpenPreflopScenario,
  onOpenPostflopSpot,
  onOpenStudyRoom,
  onOpenDbModal,
}: Pt4AnalyticsDashboardProps) {
  const leaks = analyzePt4Leaks(dbSummary);
  const totalLeakEvCost = leaks
    .reduce((acc, l) => acc + l.estimatedEvLossBb100, 0)
    .toFixed(2);

  const positionsOrder: Position[] = ["UTG", "MP", "CO", "BTN", "SB", "BB"];

  const positionToScenarioMap: Record<Position, string> = {
    UTG: "UTG_RFI",
    MP: "MP_RFI",
    CO: "CO_RFI",
    BTN: "BTN_RFI",
    SB: "SB_VS_BTN",
    BB: "BB_VS_BTN",
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Muestra PT4 ({dbSummary.playerName})
            </span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {dbSummary.totalHands.toLocaleString()} manos
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-400">{dbSummary.stakeLabel}</span>
            <button
              onClick={onOpenDbModal}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
            >
              Cambiar DB
            </button>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Winrate & All-In EV
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">
              +{dbSummary.bb100} bb/100
            </span>
            <span className="text-xs font-bold text-slate-300">
              (EV: +{dbSummary.evBb100} bb/100)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Ganancia Neta:{" "}
            <strong className="text-white">${dbSummary.netWonUsd.toLocaleString()}</strong>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Stats Preflop Globales
            </span>
            <BarChart3 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-white">
            {dbSummary.globalVpip}%{" "}
            <span className="text-slate-500 font-normal">/</span> {dbSummary.globalPfr}%{" "}
            <span className="text-slate-500 font-normal">/</span> {dbSummary.global3Bet}%
          </div>
          <div className="mt-2 text-xs text-slate-400">
            VPIP / PFR / 3-Bet (Óptimo 6-Max: ~25 / 21 / 9.5)
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
              Potencial de Mejora Detectado
            </span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            +{totalLeakEvCost} bb/100
          </div>
          <div className="mt-2 text-xs text-rose-200/80">
            Corrigiendo {leaks.filter((l) => l.severity !== "OPTIMAL").length} leaks en
            tus spots de PT4
          </div>
        </div>
      </div>

      {/* Detected Leaks & Actionable Coaching Fixes */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-400" />
              Diagnóstico de Leaks y Puntos de Mejora (Coach IA + GTO)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativa automática entre tus estadísticas de PokerTracker 4 y las
              frecuencias óptimas de Cash 6-Max (100bb).
            </p>
          </div>
          <button
            onClick={onOpenStudyRoom}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 self-start sm:self-center"
          >
            Entrenar Mis Leaks en Sala de Estudio
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {leaks.map((leak) => {
            const isCritical = leak.severity === "CRITICAL";
            const isModerate = leak.severity === "MODERATE";

            return (
              <div
                key={leak.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isCritical
                    ? "bg-rose-950/20 border-rose-500/40"
                    : isModerate
                    ? "bg-amber-950/20 border-amber-500/40"
                    : "bg-emerald-950/20 border-emerald-500/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isCritical
                            ? "bg-rose-500 text-white"
                            : isModerate
                            ? "bg-amber-400 text-slate-950"
                            : "bg-emerald-500 text-slate-950"
                        }`}
                      >
                        {isCritical
                          ? "Leak Crítico"
                          : isModerate
                          ? "Leak Moderado"
                          : "Punto Fuerte"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold">
                        Spot: {leak.position}
                      </span>
                    </div>

                    {leak.estimatedEvLossBb100 > 0 && (
                      <span className="text-xs font-extrabold text-rose-400">
                        Costo: -{leak.estimatedEvLossBb100} bb/100
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-white mb-2">
                    {leak.title}
                  </h4>

                  {/* Stat Comparison Pill */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 mb-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Tu Stat en PT4 ({leak.statName})
                      </span>
                      <span
                        className={`font-black ${
                          isCritical
                            ? "text-rose-400"
                            : isModerate
                            ? "text-amber-300"
                            : "text-emerald-400"
                        }`}
                      >
                        {leak.heroValue}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">
                        Rango GTO Recomendado
                      </span>
                      <span className="font-black text-emerald-400">
                        {leak.gtoTarget}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    <strong className="text-white">Diagnóstico: </strong>
                    {leak.diagnosis}
                  </p>
                  <p className="text-xs text-emerald-200/90 leading-relaxed mb-4">
                    <strong className="text-emerald-400">Plan de Corrección: </strong>
                    {leak.actionableFix}
                  </p>
                </div>

                {/* Action Links */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
                  {leak.linkedPreflopScenarioId && (
                    <button
                      onClick={() =>
                        onOpenPreflopScenario(leak.linkedPreflopScenarioId!)
                      }
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <span>Ver Tabla Preflop 13x13</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  )}
                  {leak.linkedPostflopSpotId && (
                    <button
                      onClick={() => onOpenPostflopSpot(leak.linkedPostflopSpotId!)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <span>Ver Estrategia Postflop</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Position-by-Position Performance Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Rendimiento por Posición (PT4 vs Benchmark GTO 6-Max)
            </h3>
            <p className="text-xs text-slate-400">
              Haz clic en cualquier posición para abrir su tabla preflop y comparar tus
              frecuencias mano por mano.
            </p>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
              <th className="py-3 px-3">Posición</th>
              <th className="py-3 px-3">Manos</th>
              <th className="py-3 px-3">VPIP (GTO)</th>
              <th className="py-3 px-3">PFR (GTO)</th>
              <th className="py-3 px-3">RFI %</th>
              <th className="py-3 px-3">3-Bet %</th>
              <th className="py-3 px-3">Cold Call %</th>
              <th className="py-3 px-3">Flop C-Bet</th>
              <th className="py-3 px-3">Winrate (bb/100)</th>
              <th className="py-3 px-3 text-right">Tabla</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {positionsOrder.map((pos) => {
              const st = dbSummary.positions[pos];
              const gto = GTO_6MAX_TARGETS[pos];

              const vpipLow = st.vpip < gto.vpipRange[0] - 2;
              const coldCallHigh = st.coldCall > gto.coldCallMax + 2;
              const threeBetLow =
                pos !== "UTG" && st.threeBet < gto.threeBetRange[0] - 1.5;

              return (
                <tr
                  key={pos}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3.5 px-3 font-black text-white">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                      {pos}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 font-medium">
                    {st.hands.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-bold ${
                        vpipLow ? "text-amber-400" : "text-white"
                      }`}
                    >
                      {st.vpip}%
                    </span>{" "}
                    <span className="text-slate-500 text-[11px]">
                      ({gto.vpipRange[0]}-{gto.vpipRange[1]}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-white">{st.pfr}%</span>{" "}
                    <span className="text-slate-500 text-[11px]">
                      ({gto.pfrRange[0]}-{gto.pfrRange[1]}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-200">
                    {pos === "BB" ? "—" : `${st.rfi}%`}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-bold ${
                        threeBetLow ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {pos === "UTG" ? "—" : `${st.threeBet}%`}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-bold ${
                        coldCallHigh ? "text-rose-400" : "text-slate-200"
                      }`}
                    >
                      {st.coldCall}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-200">
                    {st.cbetFlop}%
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-black ${
                        st.bb100 >= gto.targetBb100
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {st.bb100 > 0 ? `+${st.bb100}` : st.bb100} bb/100
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() =>
                        onOpenPreflopScenario(positionToScenarioMap[pos])
                      }
                      className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 font-bold transition-all"
                    >
                      Ver Rango
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
