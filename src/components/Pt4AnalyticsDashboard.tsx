"use client";

import React, { useMemo, useState } from "react";
import {
  Pt4DatabaseSummary,
  GTO_6MAX_TARGETS,
  analyzePt4Leaks,
  SampleFilterPreset,
  SampleFilterState,
  PT4_FILTER_PRESETS,
  getFilteredSummary,
  calculateSampleComparison,
} from "@/data/pt4Analytics";
import { Position } from "@/data/pokerRanges";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Database,
  ArrowUpRight,
  Flame,
  Target,
  BarChart3,
  Calendar,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Filter,
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
  // Filtro de muestra (estilo PokerTracker 4)
  const [filterState, setFilterState] = useState<SampleFilterState>({
    preset: "ALL_TIME",
  });
  const [customFrom, setCustomFrom] = useState("2026-10-01");
  const [customTo, setCustomTo] = useState("2026-11-16");
  const [leakFilterTab, setLeakFilterTab] = useState<"ALL" | "RESOLVED" | "ACTIVE">("ALL");

  const baselineSummary = dbSummary;

  // Obtenemos la muestra filtrada dinámicamente
  const currentSummary = useMemo(
    () => getFilteredSummary(baselineSummary, filterState),
    [baselineSummary, filterState]
  );

  // Comparación matemática y evolutiva de la muestra vs el histórico consolidado
  const comparison = useMemo(
    () => calculateSampleComparison(currentSummary, baselineSummary, filterState),
    [currentSummary, baselineSummary, filterState]
  );

  // Diagnóstico de leaks considerando evolución respecto al histórico
  const leaks = useMemo(
    () =>
      analyzePt4Leaks(
        currentSummary,
        filterState.preset !== "ALL_TIME" ? baselineSummary : undefined
      ),
    [currentSummary, baselineSummary, filterState.preset]
  );

  const resolvedLeaks = leaks.filter((l) => l.evolutionStatus === "RESOLVED");
  const activeLeaks = leaks.filter(
    (l) => l.severity === "CRITICAL" || l.severity === "MODERATE"
  );

  const displayedLeaks = useMemo(() => {
    if (leakFilterTab === "RESOLVED") return resolvedLeaks;
    if (leakFilterTab === "ACTIVE") return activeLeaks;
    return leaks;
  }, [leakFilterTab, leaks, resolvedLeaks, activeLeaks]);

  const totalLeakEvCost = activeLeaks
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

  function applyPreset(preset: SampleFilterPreset) {
    if (preset === "CUSTOM_DATE") {
      setFilterState({
        preset: "CUSTOM_DATE",
        customFrom,
        customTo,
      });
    } else {
      setFilterState({ preset });
    }
  }

  function handleApplyCustomRange() {
    setFilterState({
      preset: "CUSTOM_DATE",
      customFrom,
      customTo,
    });
  }

  return (
    <div className="space-y-6">
      {/* ---------------- POKER TRACKER 4 FILTER BAR (BARRA DESPLEGABLE) ---------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Filter className="w-4 h-4" />
              </span>
              <label
                htmlFor="pt4-sample-dropdown"
                className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap"
              >
                Muestra PT4:
              </label>
            </div>

            {/* Barra desplegable simple y unificada sin subtítulos */}
            <div className="relative w-full sm:w-[260px] md:w-[290px]">
              <select
                id="pt4-sample-dropdown"
                value={filterState.preset}
                onChange={(e) => applyPreset(e.target.value as SampleFilterPreset)}
                className="w-full appearance-none bg-slate-950 border border-slate-700 hover:border-indigo-500 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer pr-10"
              >
                <option value="ALL_TIME">Toda la muestra</option>
                <option value="TODAY">Hoy</option>
                <option value="YESTERDAY">Ayer</option>
                <option value="LAST_7_DAYS">Últimos 7 dias</option>
                <option value="LAST_30_DAYS">Últimos 30 dias</option>
                <option value="THIS_YEAR">Este año</option>
                <option value="CUSTOM_DATE">Desde - Hasta</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Botón rápido para volver al histórico si hay un filtro aplicado */}
            {comparison.isFiltered && (
              <button
                onClick={() => applyPreset("ALL_TIME")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all shrink-0"
                title="Volver a toda la muestra acumulada"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Restablecer</span>
              </button>
            )}
          </div>

          {/* Indicador de muestra activa */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Muestra evaluada:</span>
            <span className="font-semibold text-white px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
              {currentSummary.totalHands.toLocaleString()} manos
              {comparison.isFiltered && (
                <span className="text-emerald-400 font-bold ml-1.5">
                  ({comparison.handsRatioPct}%)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Selector de Rango Personalizado (Desde - Hasta) */}
        {filterState.preset === "CUSTOM_DATE" && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Fechas PT4:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-400">Desde:</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-400">Hasta:</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
              />
            </div>
            <button
              onClick={handleApplyCustomRange}
              className="px-3.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Aplicar Rango
            </button>
          </div>
        )}
      </div>

      {/* ---------------- EVOLUTION & COMPARISON BANNER ---------------- */}
      {comparison.isFiltered && (
        <div className="p-4 sm:p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900/90 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white">
                  {comparison.filterLabel}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {currentSummary.totalHands.toLocaleString()} manos ({comparison.handsRatioPct}% de tu base total)
                </span>
                {resolvedLeaks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    {resolvedLeaks.length} {resolvedLeaks.length === 1 ? "leak corregido" : "leaks corregidos"} en esta muestra
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-200 pt-1">
                {comparison.trendText}
              </p>
            </div>

            {/* Quick Metrics Comparison Diff Chips */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block font-medium">
                  Winrate Muestra
                </span>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-base font-bold text-white">
                    {currentSummary.bb100 > 0 ? `+${currentSummary.bb100}` : currentSummary.bb100} bb/100
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center ${
                      comparison.deltaBb100 >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {comparison.deltaBb100 >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {comparison.deltaBb100 >= 0 ? `+${comparison.deltaBb100}` : comparison.deltaBb100}
                  </span>
                </div>
              </div>

              <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block font-medium">
                  3-Bet Global
                </span>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-base font-bold text-white">
                    {currentSummary.global3Bet}%
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      comparison.delta3Bet >= 0 ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {comparison.delta3Bet >= 0 ? `+${comparison.delta3Bet}%` : `${comparison.delta3Bet}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TOP KPI CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Sample Hands Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">
              Muestra PT4 ({currentSummary.playerName})
            </span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">
              {currentSummary.totalHands.toLocaleString()} manos
            </span>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-slate-400 truncate">
              {comparison.isFiltered ? comparison.filterLabel : currentSummary.stakeLabel}
            </span>
            <button
              onClick={onOpenDbModal}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline shrink-0"
            >
              Cambiar DB
            </button>
          </div>
        </div>

        {/* Winrate & EV Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">
              Winrate & All-In EV {comparison.isFiltered && "(En Muestra)"}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-xl font-bold ${
                currentSummary.bb100 >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {currentSummary.bb100 > 0 ? `+${currentSummary.bb100}` : currentSummary.bb100} bb/100
            </span>
            {comparison.isFiltered && (
              <span
                className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                  comparison.deltaBb100 >= 0
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {comparison.deltaBb100 >= 0 ? `▲ +${comparison.deltaBb100}` : `▼ ${comparison.deltaBb100}`} vs hist.
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Ganancia Neta Muestra:{" "}
            <strong className="text-white">
              ${currentSummary.netWonUsd.toLocaleString()}
            </strong>{" "}
            <span className="text-slate-500">(EV: +{currentSummary.evBb100} bb/100)</span>
          </div>
        </div>

        {/* Global Preflop Stats Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">
              Stats Preflop Globales {comparison.isFiltered && "(En Muestra)"}
            </span>
            <BarChart3 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {currentSummary.globalVpip}%{" "}
            <span className="text-slate-500 font-normal">/</span> {currentSummary.globalPfr}%{" "}
            <span className="text-slate-500 font-normal">/</span> {currentSummary.global3Bet}%
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>VPIP / PFR / 3-Bet</span>
            {comparison.isFiltered && (
              <span className="text-[10px] text-indigo-300 font-medium">
                3-Bet: {comparison.delta3Bet >= 0 ? `+${comparison.delta3Bet}%` : `${comparison.delta3Bet}%`}
              </span>
            )}
          </div>
        </div>

        {/* Leaks & Potential Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-rose-300">
              Potencial de Mejora Detectado
            </span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400">
            +{totalLeakEvCost} bb/100
          </div>
          <div className="mt-2 text-xs text-rose-200/80 flex items-center justify-between">
            <span>{activeLeaks.length} leaks activos</span>
            {resolvedLeaks.length > 0 && (
              <span className="text-emerald-400 font-semibold">
                ✓ {resolvedLeaks.length} corregidos
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- LEAKS & ACTIONABLE COACHING ---------------- */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-400" />
              Diagnóstico de Leaks y Puntos de Mejora (Coach IA + GTO)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativa de tus estadísticas de PokerTracker 4 ({comparison.filterLabel})
              frente a las frecuencias óptimas de Cash 6-Max (100bb).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs for Leaks */}
            {comparison.isFiltered && resolvedLeaks.length > 0 && (
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setLeakFilterTab("ALL")}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    leakFilterTab === "ALL"
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Todos ({leaks.length})
                </button>
                <button
                  onClick={() => setLeakFilterTab("RESOLVED")}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    leakFilterTab === "RESOLVED"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-emerald-300"
                  }`}
                >
                  Corregidos ({resolvedLeaks.length})
                </button>
                <button
                  onClick={() => setLeakFilterTab("ACTIVE")}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    leakFilterTab === "ACTIVE"
                      ? "bg-rose-600 text-white"
                      : "text-slate-400 hover:text-rose-300"
                  }`}
                >
                  Activos ({activeLeaks.length})
                </button>
              </div>
            )}

            <button
              onClick={onOpenStudyRoom}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all self-start sm:self-center"
            >
              Entrenar en Sala de Estudio
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayedLeaks.map((leak) => {
            const isResolved = leak.evolutionStatus === "RESOLVED";
            const isImproving = leak.evolutionStatus === "IMPROVING";
            const isCritical = leak.severity === "CRITICAL";
            const isModerate = leak.severity === "MODERATE";

            return (
              <div
                key={leak.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  isResolved
                    ? "bg-emerald-950/25 border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                    : isImproving
                    ? "bg-indigo-950/20 border-indigo-500/30"
                    : isCritical
                    ? "bg-rose-950/20 border-slate-700"
                    : isModerate
                    ? "bg-amber-950/20 border-slate-700"
                    : "bg-emerald-950/20 border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isResolved
                            ? "bg-emerald-500 text-slate-950 flex items-center gap-1"
                            : isImproving
                            ? "bg-indigo-500 text-white flex items-center gap-1"
                            : isCritical
                            ? "bg-rose-500 text-white"
                            : isModerate
                            ? "bg-amber-400 text-slate-950"
                            : "bg-emerald-500 text-slate-950"
                        }`}
                      >
                        {isResolved ? (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>¡Leak Corregido en Muestra!</span>
                          </>
                        ) : isImproving ? (
                          <>
                            <TrendingUp className="w-3 h-3" />
                            <span>En Progreso de Mejora</span>
                          </>
                        ) : isCritical ? (
                          "Leak Crítico"
                        ) : isModerate ? (
                          "Leak Moderado"
                        ) : (
                          "Punto Fuerte"
                        )}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-medium">
                        Spot: {leak.position}
                      </span>
                    </div>

                    {leak.estimatedEvLossBb100 > 0 ? (
                      <span className="text-xs font-semibold text-rose-400">
                        Costo: -{leak.estimatedEvLossBb100} bb/100
                      </span>
                    ) : isResolved ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        EV Recuperado
                      </span>
                    ) : null}
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white mb-2">
                    {leak.title}
                  </h4>

                  {/* Stat Comparison Pill */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 mb-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Tu Stat en esta Muestra ({leak.statName})
                      </span>
                      <span
                        className={`font-semibold ${
                          isResolved
                            ? "text-emerald-400 font-bold"
                            : isCritical
                            ? "text-rose-400"
                            : isModerate
                            ? "text-amber-300"
                            : "text-emerald-400"
                        }`}
                      >
                        {leak.heroValue}
                      </span>
                      {leak.baselineValue && (
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          vs {leak.baselineValue}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        Rango GTO Recomendado
                      </span>
                      <span className="font-semibold text-emerald-400">
                        {leak.gtoTarget}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    <strong className="text-white">Diagnóstico: </strong>
                    {leak.diagnosis}
                  </p>
                  <p className="text-xs text-emerald-200/90 leading-relaxed mb-4">
                    <strong className="text-emerald-400">Plan de Acción: </strong>
                    {leak.actionableFix}
                  </p>

                  {leak.evolutionNote && (
                    <div className="mb-4 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium">
                      💡 {leak.evolutionNote}
                    </div>
                  )}
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

      {/* ---------------- POSITION TABLE ---------------- */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Rendimiento por Posición ({comparison.filterLabel})</span>
              {comparison.isFiltered && (
                <span className="text-xs font-normal text-indigo-400">
                  (Comparativa vs Benchmark GTO 6-Max)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Haz clic en cualquier posición para abrir su tabla preflop y comparar tus
              frecuencias mano por mano.
            </p>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
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
              const st = currentSummary.positions[pos];
              const baseSt = baselineSummary.positions[pos];
              const gto = GTO_6MAX_TARGETS[pos];

              const vpipLow = st.vpip < gto.vpipRange[0] - 2;
              const coldCallHigh = st.coldCall > gto.coldCallMax + 2;
              const threeBetLow =
                pos !== "UTG" && st.threeBet < gto.threeBetRange[0] - 1.5;

              const deltaBb = comparison.isFiltered && baseSt
                ? Number((st.bb100 - baseSt.bb100).toFixed(1))
                : 0;

              return (
                <tr
                  key={pos}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3.5 px-3 font-bold text-white">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                      {pos}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 font-medium">
                    {st.hands.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-medium ${
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
                    <span className="font-medium text-white">{st.pfr}%</span>{" "}
                    <span className="text-slate-500 text-[11px]">
                      ({gto.pfrRange[0]}-{gto.pfrRange[1]}%)
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-medium text-slate-200">
                    {pos === "BB" ? "—" : `${st.rfi}%`}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-medium ${
                        threeBetLow ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {pos === "UTG" ? "—" : `${st.threeBet}%`}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-medium ${
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
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-bold ${
                          st.bb100 >= gto.targetBb100
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {st.bb100 > 0 ? `+${st.bb100}` : st.bb100} bb/100
                      </span>
                      {comparison.isFiltered && deltaBb !== 0 && (
                        <span
                          className={`text-[10px] font-semibold ${
                            deltaBb > 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          ({deltaBb > 0 ? `+${deltaBb}` : deltaBb})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() =>
                        onOpenPreflopScenario(positionToScenarioMap[pos])
                      }
                      className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-slate-700 font-medium transition-all"
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
