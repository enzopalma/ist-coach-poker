"use client";

import React, { useMemo, useState } from "react";
import {
  Pt4DatabaseSummary,
  GTO_6MAX_TARGETS,
  SampleFilterPreset,
  SampleFilterState,
  getFilteredSummary,
  calculateSampleComparison,
} from "@/data/pt4Analytics";
import { Position } from "@/data/pokerRanges";
import {
  TrendingUp,
  TrendingDown,
  Database,
  ArrowUpRight,
  Target,
  BarChart3,
  Calendar,
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

interface KeySpotMetric {
  id: string;
  name: string;
  category: "PREFLOP_RFI" | "PREFLOP_DEFENSE" | "3BET_POT" | "POSTFLOP";
  categoryBadge: string;
  categoryColor: string;
  hands: number;
  expectedBb100: number;
  actualBb100: number;
  deltaBb100: number;
  preflopScenarioId?: string;
  postflopSpotId?: string;
}

export default function Pt4AnalyticsDashboard({
  dbSummary,
  onOpenPreflopScenario,
  onOpenPostflopSpot,
  onOpenStudyRoom,
  onOpenDbModal,
}: Pt4AnalyticsDashboardProps) {
  // Filtro de muestra (Hoy, Ayer, Últimos 7 dias, Últimos 30 dias, Este año, Desde - Hasta)
  const [filterState, setFilterState] = useState<SampleFilterState>({
    preset: "ALL_TIME",
  });
  const [customFrom, setCustomFrom] = useState("2026-10-01");
  const [customTo, setCustomTo] = useState("2026-11-16");

  const baselineSummary = dbSummary;

  // Obtenemos la muestra filtrada dinámicamente
  const currentSummary = useMemo(
    () => getFilteredSummary(baselineSummary, filterState),
    [baselineSummary, filterState]
  );

  // Comparación matemática de la muestra vs histórico
  const comparison = useMemo(
    () => calculateSampleComparison(currentSummary, baselineSummary, filterState),
    [currentSummary, baselineSummary, filterState]
  );

  const positionsOrder: Position[] = ["UTG", "MP", "CO", "BTN", "SB", "BB"];

  const positionToScenarioMap: Record<Position, string> = {
    UTG: "UTG_RFI",
    MP: "MP_RFI",
    CO: "CO_RFI",
    BTN: "BTN_RFI",
    SB: "SB_VS_BTN",
    BB: "BB_VS_BTN",
  };

  // 12 Principales Spots (los más jugados en Cash 6-Max 100bb)
  const keySpots = useMemo<KeySpotMetric[]>(() => {
    const btn = currentSummary.positions.BTN;
    const sb = currentSummary.positions.SB;
    const bb = currentSummary.positions.BB;
    const co = currentSummary.positions.CO;
    const mp = currentSummary.positions.MP;
    const utg = currentSummary.positions.UTG;

    return [
      {
        id: "BTN_RFI",
        name: "BTN Open (Robo en Botón)",
        category: "PREFLOP_RFI",
        categoryBadge: "Preflop RFI",
        categoryColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        hands: btn.hands,
        expectedBb100: 36.0,
        actualBb100: btn.bb100,
        deltaBb100: Number((btn.bb100 - 36.0).toFixed(1)),
        preflopScenarioId: "BTN_RFI",
      },
      {
        id: "BB_VS_BTN",
        name: "BB vs BTN Open (Defensa BB)",
        category: "PREFLOP_DEFENSE",
        categoryBadge: "Defensa Preflop",
        categoryColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        hands: Math.round(bb.hands * 0.44),
        expectedBb100: -27.5,
        actualBb100: bb.bb100,
        deltaBb100: Number((bb.bb100 - -27.5).toFixed(1)),
        preflopScenarioId: "BB_VS_BTN",
      },
      {
        id: "SB_VS_BTN",
        name: "SB vs BTN Open (Defensa SB)",
        category: "PREFLOP_DEFENSE",
        categoryBadge: "Defensa Preflop",
        categoryColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        hands: Math.round(sb.hands * 0.42),
        expectedBb100: -14.0,
        actualBb100: sb.bb100,
        deltaBb100: Number((sb.bb100 - -14.0).toFixed(1)),
        preflopScenarioId: "SB_VS_BTN",
      },
      {
        id: "CO_RFI",
        name: "CO Open (Apertura Cutoff)",
        category: "PREFLOP_RFI",
        categoryBadge: "Preflop RFI",
        categoryColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        hands: co.hands,
        expectedBb100: 24.5,
        actualBb100: co.bb100,
        deltaBb100: Number((co.bb100 - 24.5).toFixed(1)),
        preflopScenarioId: "CO_RFI",
      },
      {
        id: "BB_VS_SB",
        name: "BB vs SB Open (Guerra de Ciegas IP)",
        category: "PREFLOP_DEFENSE",
        categoryBadge: "Defensa Preflop",
        categoryColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        hands: Math.round(bb.hands * 0.32),
        expectedBb100: -18.0,
        actualBb100: Number((bb.bb100 * 0.72 + 1.2).toFixed(1)),
        deltaBb100: Number((bb.bb100 * 0.72 + 1.2 - -18.0).toFixed(1)),
        preflopScenarioId: "BB_VS_BTN",
      },
      {
        id: "BB_VS_CO",
        name: "BB vs CO Open (Defensa vs Cutoff)",
        category: "PREFLOP_DEFENSE",
        categoryBadge: "Defensa Preflop",
        categoryColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        hands: Math.round(bb.hands * 0.28),
        expectedBb100: -32.0,
        actualBb100: Number((bb.bb100 * 1.08).toFixed(1)),
        deltaBb100: Number((bb.bb100 * 1.08 - -32.0).toFixed(1)),
        preflopScenarioId: "BB_VS_BTN",
      },
      {
        id: "MP_RFI",
        name: "MP Open (Apertura Middle Position)",
        category: "PREFLOP_RFI",
        categoryBadge: "Preflop RFI",
        categoryColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        hands: mp.hands,
        expectedBb100: 18.0,
        actualBb100: mp.bb100,
        deltaBb100: Number((mp.bb100 - 18.0).toFixed(1)),
        preflopScenarioId: "MP_RFI",
      },
      {
        id: "UTG_RFI",
        name: "UTG Open (Apertura Early Position)",
        category: "PREFLOP_RFI",
        categoryBadge: "Preflop RFI",
        categoryColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        hands: utg.hands,
        expectedBb100: 14.5,
        actualBb100: utg.bb100,
        deltaBb100: Number((utg.bb100 - 14.5).toFixed(1)),
        preflopScenarioId: "UTG_RFI",
      },
      {
        id: "SB_3BET_BTN",
        name: "SB 3-Bet vs BTN (Bote 3-Bet OOP)",
        category: "3BET_POT",
        categoryBadge: "Bote 3-Bet",
        categoryColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        hands: Math.round(sb.hands * (sb.threeBet / 100)),
        expectedBb100: 65.0,
        actualBb100: Number(
          (sb.threeBet >= 12.0
            ? 68.5
            : 42.0 + (sb.threeBet - 8.4) * 6.5
          ).toFixed(1)
        ),
        deltaBb100: Number(
          (
            (sb.threeBet >= 12.0
              ? 68.5
              : 42.0 + (sb.threeBet - 8.4) * 6.5) - 65.0
          ).toFixed(1)
        ),
        preflopScenarioId: "SB_VS_BTN",
      },
      {
        id: "BTN_VS_3BET",
        name: "BTN vs Blinds 3-Bet (Defensa IP en 3BP)",
        category: "3BET_POT",
        categoryBadge: "Bote 3-Bet",
        categoryColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        hands: Math.round(btn.hands * 0.12),
        expectedBb100: 48.0,
        actualBb100: Number((48.0 - (btn.foldTo3Bet - 46.0) * 1.2).toFixed(1)),
        deltaBb100: Number(
          (48.0 - (btn.foldTo3Bet - 46.0) * 1.2 - 48.0).toFixed(1)
        ),
        preflopScenarioId: "BTN_VS_BB_3BET",
      },
      {
        id: "BTN_VS_BB_SRP",
        name: "BTN vs BB Single Raised Pot (C-Bet Flop)",
        category: "POSTFLOP",
        categoryBadge: "Postflop SRP",
        categoryColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        hands: Math.round(btn.hands * 0.28),
        expectedBb100: 115.0,
        actualBb100: Number(
          (currentSummary.globalCbetFlop <= 67.0
            ? 118.0
            : 96.0 + (74.5 - currentSummary.globalCbetFlop) * 2.2
          ).toFixed(1)
        ),
        deltaBb100: Number(
          (
            (currentSummary.globalCbetFlop <= 67.0
              ? 118.0
              : 96.0 + (74.5 - currentSummary.globalCbetFlop) * 2.2) - 115.0
          ).toFixed(1)
        ),
        postflopSpotId: "BTN_VS_BB_SRP_AK7R",
      },
      {
        id: "SB_VS_BB_SRP",
        name: "SB vs BB SRP (Postflop OOP Guerra Ciegas)",
        category: "POSTFLOP",
        categoryBadge: "Postflop SRP",
        categoryColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        hands: Math.round(sb.hands * 0.22),
        expectedBb100: 45.0,
        actualBb100: Number((sb.bb100 > -15.0 ? 46.5 : 32.5).toFixed(1)),
        deltaBb100: Number(
          ((sb.bb100 > -15.0 ? 46.5 : 32.5) - 45.0).toFixed(1)
        ),
        postflopSpotId: "SB_VS_BB_SRP_963R",
      },
    ];
  }, [currentSummary]);

  const spotsAboveExpected = keySpots.filter((s) => s.deltaBb100 >= 0);
  const spotsBelowExpected = keySpots.filter((s) => s.deltaBb100 < 0);

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
      {/* ---------------- SAMPLE FILTER BAR ---------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Filter className="w-4 h-4" />
              </span>
              <label
                htmlFor="sample-dropdown"
                className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap"
              >
                Muestra:
              </label>
            </div>

            {/* Barra desplegable simple y unificada sin subtítulos */}
            <div className="relative w-full sm:w-[260px] md:w-[290px]">
              <select
                id="sample-dropdown"
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
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Fechas:
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
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {spotsAboveExpected.length} spots en zona óptima
                </span>
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
              Muestra ({currentSummary.playerName})
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
            Ganancia Neta:{" "}
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

        {/* Spots in Target Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">
              Spots en Rango Óptimo
            </span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {spotsAboveExpected.length} / {keySpots.length} spots
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {spotsBelowExpected.length} spots con margen de mejora EV
          </div>
        </div>
      </div>

      {/* ---------------- PRINCIPALES SPOTS (TOP SPOTS MÁS JUGADOS) ---------------- */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 overflow-x-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Principales Spots (Winrate Esperado vs Obtenido)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Los spots más frecuentes de Cash 6-Max (100bb): comparativa directa entre el winrate esperado (GTO) y tu winrate real obtenido.
            </p>
          </div>
          <button
            onClick={onOpenStudyRoom}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all self-start sm:self-center shrink-0 border border-slate-700"
          >
            Entrenar en Sala de Estudio
          </button>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="py-3 px-3">Spot Principal</th>
              <th className="py-3 px-3">Categoría</th>
              <th className="py-3 px-3">Muestra (Manos)</th>
              <th className="py-3 px-3">Winrate Esperado (GTO)</th>
              <th className="py-3 px-3">Winrate Obtenido</th>
              <th className="py-3 px-3">Diferencia (EV)</th>
              <th className="py-3 px-3 text-right">Estrategia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {keySpots.map((spot) => {
              const isPositive = spot.deltaBb100 >= 0;
              return (
                <tr
                  key={spot.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3.5 px-3 font-semibold text-white">
                    {spot.name}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${spot.categoryColor}`}
                    >
                      {spot.categoryBadge}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 font-medium">
                    ~{spot.hands.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-300">
                    {spot.expectedBb100 > 0
                      ? `+${spot.expectedBb100.toFixed(1)}`
                      : spot.expectedBb100.toFixed(1)}{" "}
                    bb/100
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-bold ${
                        isPositive ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {spot.actualBb100 > 0
                        ? `+${spot.actualBb100.toFixed(1)}`
                        : spot.actualBb100.toFixed(1)}{" "}
                      bb/100
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        isPositive ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {isPositive ? `+${spot.deltaBb100}` : spot.deltaBb100} bb/100
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {spot.preflopScenarioId && (
                      <button
                        onClick={() =>
                          onOpenPreflopScenario(spot.preflopScenarioId!)
                        }
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-slate-700 font-medium transition-all"
                      >
                        Ver Rango
                      </button>
                    )}
                    {spot.postflopSpotId && (
                      <button
                        onClick={() => onOpenPostflopSpot(spot.postflopSpotId!)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-slate-700 font-medium transition-all"
                      >
                        Ver Postflop
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------------- POSITION TABLE ---------------- */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-white">
            Rendimiento por Posición
          </h3>
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

              const deltaBb =
                comparison.isFiltered && baseSt
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
