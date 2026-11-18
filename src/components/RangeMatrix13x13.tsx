"use client";

import React, { useState, useEffect } from "react";
import {
  RANKS,
  getHandLabel,
  getHandCombos,
  PreflopScenario,
  HandFrequencies,
  getAll169Hands,
} from "@/data/pokerRanges";
import { RangeOverride, rangeToText, Frequencies } from "@/data/spots";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Edit3,
  Save,
  RotateCcw,
  Trash2,
  Check,
  Sliders,
  Paintbrush,
} from "lucide-react";

interface RangeMatrix13x13Props {
  scenario: PreflopScenario;
  onSaveOverride?: (ov: RangeOverride) => void;
  onResetOverride?: () => void;
  isOverridden?: boolean;
}

type MatrixViewMode = "GTO" | "PT4_HERO" | "DIFF";
type HandFilter = "ALL" | "PAIRS" | "SUITED" | "OFFSUIT" | "MIXED" | "LEAKS";

// Preset de Pinceles
export type BrushPreset =
  | "RAISE_100"
  | "CALL_100"
  | "ALLIN_100"
  | "ALLIN_50_RAISE_50"
  | "ALLIN_50_CALL_50"
  | "ALLIN_50_FOLD_50"
  | "RAISE_50_CALL_50"
  | "RAISE_50_FOLD_50"
  | "CALL_50_FOLD_50"
  | "CUSTOM"
  | "FOLD_100";

const PRESET_DEFINITIONS: Record<
  Exclude<BrushPreset, "CUSTOM">,
  {
    label: string;
    badgeStyle: string;
    apply: () => HandFrequencies;
  }
> = {
  // Puros (100%)
  RAISE_100: {
    label: "100% Raise",
    badgeStyle: "bg-rose-600 text-white border-rose-500",
    apply: () => ({ raise: 100, call: 0, allIn: 0, fold: 0 }),
  },
  CALL_100: {
    label: "100% Call",
    badgeStyle: "bg-emerald-600 text-white border-emerald-500",
    apply: () => ({ raise: 0, call: 100, allIn: 0, fold: 0 }),
  },
  ALLIN_100: {
    label: "100% All-In",
    badgeStyle: "bg-red-950 text-red-300 border-red-700",
    apply: () => ({ raise: 0, call: 0, allIn: 100, fold: 0 }),
  },

  // Combinaciones con All-In (50%)
  ALLIN_50_RAISE_50: {
    label: "50% All-In / 50% Raise",
    badgeStyle: "border-red-600 text-red-200 bg-slate-900",
    apply: () => ({ raise: 50, call: 0, allIn: 50, fold: 0 }),
  },
  ALLIN_50_CALL_50: {
    label: "50% All-In / 50% Call",
    badgeStyle: "border-amber-500 text-amber-200 bg-slate-900",
    apply: () => ({ raise: 0, call: 50, allIn: 50, fold: 0 }),
  },
  ALLIN_50_FOLD_50: {
    label: "50% All-In / 50% Fold",
    badgeStyle: "border-red-900 text-slate-300 bg-slate-950",
    apply: () => ({ raise: 0, call: 0, allIn: 50, fold: 50 }),
  },

  // Combinaciones Raise / Call / Fold (50%)
  RAISE_50_CALL_50: {
    label: "50% Raise / 50% Call",
    badgeStyle: "border-indigo-400 text-white bg-slate-900",
    apply: () => ({ raise: 50, call: 50, allIn: 0, fold: 0 }),
  },
  RAISE_50_FOLD_50: {
    label: "50% Raise / 50% Fold",
    badgeStyle: "border-rose-600/70 text-rose-300 bg-slate-950",
    apply: () => ({ raise: 50, call: 0, allIn: 0, fold: 50 }),
  },
  CALL_50_FOLD_50: {
    label: "50% Call / 50% Fold",
    badgeStyle: "border-emerald-600/70 text-emerald-300 bg-slate-950",
    apply: () => ({ raise: 0, call: 50, allIn: 0, fold: 50 }),
  },

  // Borrar
  FOLD_100: {
    label: "0% Borrar (Fold)",
    badgeStyle: "bg-slate-950 text-slate-400 border-slate-700",
    apply: () => ({ raise: 0, call: 0, allIn: 0, fold: 100 }),
  },
};

export default function RangeMatrix13x13({
  scenario,
  onSaveOverride,
  onResetOverride,
  isOverridden,
}: RangeMatrix13x13Props) {
  const [viewMode, setViewMode] = useState<MatrixViewMode>("GTO");
  const [filter, setFilter] = useState<HandFilter>("ALL");
  const [selectedHand, setSelectedHand] = useState<string>("A5s");

  // Modo Editor
  const [isEditing, setIsEditing] = useState(false);
  const [localFreqs, setLocalFreqs] = useState<Frequencies>({});
  const [activeBrush, setActiveBrush] = useState<BrushPreset>("RAISE_100");
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pincel Personalizado Libre
  const [customAllIn, setCustomAllIn] = useState<number>(0);
  const [customRaise, setCustomRaise] = useState<number>(50);
  const [customCall, setCustomCall] = useState<number>(50);

  // Inicializar frecuencias al cambiar spot
  useEffect(() => {
    setLocalFreqs({ ...scenario.frequencies });
    setIsEditing(false);
  }, [scenario.id, scenario.frequencies]);

  // Manejar mouse up global
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  function handleStartEditing() {
    setLocalFreqs({ ...scenario.frequencies });
    setIsEditing(true);
    setViewMode("GTO");
  }

  function handleCancelEditing() {
    setLocalFreqs({ ...scenario.frequencies });
    setIsEditing(false);
  }

  function handleSaveEditing() {
    if (!onSaveOverride) return;
    const ov: RangeOverride = {
      raise: rangeToText(localFreqs, "raise"),
      call: rangeToText(localFreqs, "call"),
      allIn: rangeToText(localFreqs, "allIn"),
    };
    onSaveOverride(ov);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }

  function handleClearAll() {
    if (window.confirm("¿Vaciar toda la tabla para empezar de cero?")) {
      const empty: Frequencies = {};
      for (const h of getAll169Hands()) {
        empty[h] = { raise: 0, call: 0, allIn: 0, fold: 100 };
      }
      setLocalFreqs(empty);
    }
  }

  function handleResetDefault() {
    if (window.confirm("¿Restablecer la tabla al rango original?")) {
      if (onResetOverride) onResetOverride();
      setIsEditing(false);
    }
  }

  // Generar las frecuencias actuales del pincel
  function getFrequenciesForBrush(preset: BrushPreset): HandFrequencies {
    if (preset === "CUSTOM") {
      let ai = Math.max(0, Math.min(100, customAllIn));
      let r = Math.max(0, Math.min(100 - ai, customRaise));
      let c = Math.max(0, Math.min(100 - ai - r, customCall));
      return {
        allIn: ai,
        raise: r,
        call: c,
        fold: Math.max(0, 100 - ai - r - c),
      };
    }
    return PRESET_DEFINITIONS[preset].apply();
  }

  // Aplicar pincel a una mano
  function applyBrushToHand(hand: string, preset = activeBrush) {
    if (!isEditing) return;
    const freqs = getFrequenciesForBrush(preset);

    setLocalFreqs((prev) => {
      const next = { ...prev };
      next[hand] = freqs;
      return next;
    });
  }

  // Modificar manualmente una mano en el inspector
  function setExactHandFrequencies(
    hand: string,
    allIn: number,
    raise: number,
    call: number
  ) {
    let ai = Math.max(0, Math.min(100, allIn));
    let r = Math.max(0, Math.min(100 - ai, raise));
    let c = Math.max(0, Math.min(100 - ai - r, call));
    const freqs: HandFrequencies = {
      allIn: ai,
      raise: r,
      call: c,
      fold: Math.max(0, 100 - ai - r - c),
    };

    setLocalFreqs((prev) => ({
      ...prev,
      [hand]: freqs,
    }));
  }

  function handleCellClick(hand: string) {
    setSelectedHand(hand);
    if (isEditing) {
      applyBrushToHand(hand);
    }
  }

  function handleCellMouseEnter(hand: string) {
    setSelectedHand(hand);
    if (isEditing && isMouseDown) {
      applyBrushToHand(hand);
    }
  }

  const currentFrequencies = isEditing ? localFreqs : scenario.frequencies;

  const activeGto = currentFrequencies[selectedHand] || {
    raise: 0,
    call: 0,
    allIn: 0,
    fold: 100,
  };
  const activeHero = scenario.pt4HeroFrequencies[selectedHand] || {
    raise: 0,
    call: 0,
    allIn: 0,
    fold: 100,
  };

  const raiseLabel =
    scenario.category === "RFI"
      ? `Open Raise (${scenario.sizing})`
      : scenario.category === "VS_OPEN"
      ? `3-Bet (${scenario.sizing.replace("3-Bet a ", "")})`
      : `4-Bet (23.5 bb)`;

  function matchesFilter(
    hand: string,
    gto: HandFrequencies,
    hero: HandFrequencies
  ): boolean {
    if (filter === "ALL") return true;
    if (filter === "PAIRS") return hand.length === 2;
    if (filter === "SUITED") return hand.endsWith("s");
    if (filter === "OFFSUIT") return hand.endsWith("o");
    if (filter === "MIXED") {
      const played = (gto.raise || 0) + (gto.call || 0) + (gto.allIn || 0);
      return played > 0 && played < 100;
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

  // Cálculo en vivo de combos y porcentajes
  let livePlayedCombos = 0;
  let liveRaiseCombos = 0;
  let liveCallCombos = 0;
  let liveAllInCombos = 0;

  for (const h of getAll169Hands()) {
    const f = currentFrequencies[h];
    if (f) {
      const c = getHandCombos(h);
      const r = f.raise || 0;
      const cl = f.call || 0;
      const ai = f.allIn || 0;

      liveRaiseCombos += (c * r) / 100;
      liveCallCombos += (c * cl) / 100;
      liveAllInCombos += (c * ai) / 100;
      livePlayedCombos += (c * (r + cl + ai)) / 100;
    }
  }

  const liveTotalPct = ((livePlayedCombos / 1326) * 100).toFixed(1);
  const liveRaisePct = ((liveRaiseCombos / 1326) * 100).toFixed(1);
  const liveCallPct = ((liveCallCombos / 1326) * 100).toFixed(1);
  const liveAllInPct = ((liveAllInCombos / 1326) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Columna Izquierda: Matriz 13x13 & Herramientas */}
      <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        {/* Barra Superior */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          {!isEditing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartEditing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Tabla</span>
              </button>

              {isOverridden && (
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Rango personalizado activo
                </span>
              )}

              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> ¡Guardado con éxito!
                </span>
              )}
            </div>
          ) : (
            /* Barra de Controles en Modo Edición */
            <div className="w-full space-y-3 bg-slate-950 p-3 rounded-xl border border-indigo-500/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Modo Editor: Haz clic o arrastra sobre las manos
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearAll}
                    className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1"
                    title="Vaciar tabla para empezar de cero"
                  >
                    <Trash2 className="w-3 h-3" /> Limpiar
                  </button>

                  {isOverridden && onResetOverride && (
                    <button
                      onClick={handleResetDefault}
                      className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1"
                      title="Restablecer al original"
                    >
                      <RotateCcw className="w-3 h-3" /> Restablecer
                    </button>
                  )}

                  <button
                    onClick={handleCancelEditing}
                    className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSaveEditing}
                    className="px-4 py-1 rounded text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" /> Guardar Tabla
                  </button>
                </div>
              </div>

              {/* Selector de Pinceles Rápidos */}
              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Selecciona el Pincel Activo:</span>
                  <button
                    type="button"
                    onClick={() => setActiveBrush("CUSTOM")}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                      activeBrush === "CUSTOM"
                        ? "bg-indigo-600 text-white font-bold"
                        : "hover:text-white"
                    }`}
                  >
                    <Sliders className="w-3 h-3" /> Pincel Personalizado (%)
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      "RAISE_100",
                      "CALL_100",
                      "ALLIN_100",
                      "ALLIN_50_RAISE_50",
                      "ALLIN_50_CALL_50",
                      "ALLIN_50_FOLD_50",
                      "RAISE_50_CALL_50",
                      "RAISE_50_FOLD_50",
                      "CALL_50_FOLD_50",
                      "FOLD_100",
                    ] as (Exclude<BrushPreset, "CUSTOM">)[]
                  ).map((preset) => {
                    const cfg = PRESET_DEFINITIONS[preset];
                    const isSelected = activeBrush === preset;

                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setActiveBrush(preset)}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? `${cfg.badgeStyle} ring-2 ring-white scale-105 shadow-md`
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {/* Mini preview visual del pincel */}
                        {preset === "ALLIN_50_RAISE_50" ? (
                          <span
                            className="w-2.5 h-2.5 rounded-sm inline-block border border-white/50"
                            style={{
                              background:
                                "linear-gradient(to right, #881337 50%, #f43f5e 50%)",
                            }}
                          />
                        ) : preset === "ALLIN_50_CALL_50" ? (
                          <span
                            className="w-2.5 h-2.5 rounded-sm inline-block border border-white/50"
                            style={{
                              background:
                                "linear-gradient(to right, #881337 50%, #10b981 50%)",
                            }}
                          />
                        ) : preset === "ALLIN_50_FOLD_50" ? (
                          <span
                            className="w-2.5 h-2.5 rounded-sm inline-block border border-white/50"
                            style={{
                              background:
                                "linear-gradient(to right, #881337 50%, #0f172a 50%)",
                            }}
                          />
                        ) : preset === "RAISE_50_CALL_50" ? (
                          <span
                            className="w-2.5 h-2.5 rounded-sm inline-block border border-white/50"
                            style={{
                              background:
                                "linear-gradient(to right, #f43f5e 50%, #10b981 50%)",
                            }}
                          />
                        ) : preset === "RAISE_50_FOLD_50" ? (
                          <span
                            className="w-2.5 h-2.5 rounded-sm inline-block border border-white/50"
                            style={{
                              background:
                                "linear-gradient(to right, #f43f5e 50%, #0f172a 50%)",
                            }}
                          />
                        ) : preset === "CALL_50_FOLD_50" ? (
                          <span
                            className="w-2.5 h-2.5 rounded-sm inline-block border border-white/50"
                            style={{
                              background:
                                "linear-gradient(to right, #10b981 50%, #0f172a 50%)",
                            }}
                          />
                        ) : preset === "ALLIN_100" ? (
                          <span className="w-2.5 h-2.5 rounded-sm bg-red-950 border border-red-700 inline-block" />
                        ) : preset === "RAISE_100" ? (
                          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                        ) : preset === "CALL_100" ? (
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-sm bg-slate-950 border border-slate-700 inline-block" />
                        )}
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Si está activo el Pincel Personalizado (%) */}
                {activeBrush === "CUSTOM" && (
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center gap-4 text-xs mt-2">
                    <span className="text-indigo-300 font-semibold">
                      Configura el Pincel a Medida:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-red-300">All-In:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={10}
                        value={customAllIn}
                        onChange={(e) =>
                          setCustomAllIn(Math.max(0, Math.min(100, Number(e.target.value))))
                        }
                        className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono"
                      />
                      <span>%</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-rose-300">Raise:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={10}
                        value={customRaise}
                        onChange={(e) =>
                          setCustomRaise(Math.max(0, Math.min(100, Number(e.target.value))))
                        }
                        className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono"
                      />
                      <span>%</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-300">Call:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={10}
                        value={customCall}
                        onChange={(e) =>
                          setCustomCall(Math.max(0, Math.min(100, Number(e.target.value))))
                        }
                        className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white font-mono"
                      />
                      <span>%</span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Fold:{" "}
                      <strong className="text-slate-200">
                        {Math.max(0, 100 - customAllIn - customRaise - customCall)}%
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vistas Referencia / PT4 (fuera de edición) */}
          {!isEditing && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode("GTO")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "GTO"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Rango {isOverridden ? "Personalizado" : "GTO Referencia"}
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
                Comparar Leaks
              </button>
            </div>
          )}
        </div>

        {/* Leyenda y Contador en Vivo */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Raise */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
              <span className="text-slate-300 font-medium">Raise:</span>
              <span className="text-white font-mono font-bold">
                {isEditing ? liveRaisePct : scenario.gtoSummary.raisePct}%
              </span>
            </div>

            {/* Call */}
            {(isEditing ? Number(liveCallPct) > 0 : scenario.gtoSummary.callPct > 0) && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                <span className="text-slate-300 font-medium">Call:</span>
                <span className="text-white font-mono font-bold">
                  {isEditing ? liveCallPct : scenario.gtoSummary.callPct}%
                </span>
              </div>
            )}

            {/* All-In */}
            {(isEditing ? Number(liveAllInPct) > 0 : (scenario.gtoSummary as any).allInPct > 0) && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-950 border border-red-700 inline-block" />
                <span className="text-slate-300 font-medium">All-In:</span>
                <span className="text-white font-mono font-bold">
                  {isEditing ? liveAllInPct : (scenario.gtoSummary as any).allInPct || 0}%
                </span>
              </div>
            )}

            {/* Total Jugado */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-950 border border-slate-700 inline-block" />
              <span className="text-slate-400">Total:</span>
              <span className="text-emerald-400 font-mono font-bold">
                {isEditing
                  ? `${liveTotalPct}% (${Math.round(livePlayedCombos)} combos)`
                  : `${(100 - scenario.gtoSummary.foldPct).toFixed(1)}% (${scenario.gtoSummary.totalCombosPlayed} combos)`}
              </span>
            </div>
          </div>

          {/* Filtros de mano */}
          <div className="flex items-center gap-1">
            {(
              [
                { id: "ALL", label: "Todas" },
                { id: "PAIRS", label: "Pares" },
                { id: "SUITED", label: "Suited" },
                { id: "OFFSUIT", label: "Off" },
              ] as { id: HandFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  filter === f.id
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Matriz 13x13 Interactiva */}
        <div
          className="grid grid-cols-13 gap-1 select-none"
          onMouseDown={() => setIsMouseDown(true)}
        >
          {RANKS.map((_, rowIdx) =>
            RANKS.map((__, colIdx) => {
              const hand = getHandLabel(rowIdx, colIdx);
              const gto = currentFrequencies[hand] || {
                raise: 0,
                call: 0,
                allIn: 0,
                fold: 100,
              };
              const hero = scenario.pt4HeroFrequencies[hand] || {
                raise: 0,
                call: 0,
                allIn: 0,
                fold: 100,
              };
              const source = viewMode === "PT4_HERO" && !isEditing ? hero : gto;
              const isSelected = selectedHand === hand;
              const isVisible = matchesFilter(hand, gto, hero);

              const diffRaise = Math.abs(gto.raise - hero.raise);
              const diffCall = Math.abs(gto.call - hero.call);
              const hasDeviation = diffRaise >= 20 || diffCall >= 20;
              const isPair = rowIdx === colIdx;

              const r = source.raise || 0;
              const c = source.call || 0;
              const a = source.allIn || 0;

              return (
                <button
                  key={hand}
                  type="button"
                  onClick={() => handleCellClick(hand)}
                  onMouseEnter={() => handleCellMouseEnter(hand)}
                  className={`relative h-10 sm:h-12 rounded-md overflow-hidden border transition-all flex flex-col justify-between p-1 text-left ${
                    !isVisible ? "opacity-20 grayscale" : "opacity-100"
                  } ${
                    isSelected
                      ? "ring-2 ring-white border-white z-10 scale-[1.04]"
                      : isEditing
                      ? "cursor-crosshair hover:ring-1 hover:ring-indigo-400 border-slate-800"
                      : viewMode === "DIFF" && hasDeviation
                      ? "border-amber-400/90"
                      : isPair
                      ? "border-slate-600/80"
                      : "border-slate-800/90"
                  }`}
                  style={{
                    background: `linear-gradient(to right, 
                      #881337 0%, 
                      #881337 ${a}%, 
                      #f43f5e ${a}%, 
                      #f43f5e ${a + r}%, 
                      #10b981 ${a + r}%, 
                      #10b981 ${a + r + c}%, 
                      #0f172a ${a + r + c}%, 
                      #0f172a 100%)`,
                  }}
                >
                  <div className="flex items-center justify-between w-full z-10">
                    <span
                      className={`text-[10px] sm:text-xs font-bold leading-none ${
                        r + c + a > 15 ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {hand}
                    </span>
                    {viewMode === "DIFF" && hasDeviation && !isEditing && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>

                  {/* Subetiquetas de frecuencia */}
                  <div className="w-full flex items-center justify-between z-10">
                    {a > 0 && r > 0 ? (
                      <span className="text-[8px] font-bold text-white bg-slate-950/90 px-0.5 rounded leading-tight">
                        AI/R
                      </span>
                    ) : a > 0 && c > 0 ? (
                      <span className="text-[8px] font-bold text-white bg-slate-950/90 px-0.5 rounded leading-tight">
                        AI/C
                      </span>
                    ) : r === 50 && c === 50 ? (
                      <span className="text-[8px] font-bold text-white bg-slate-950/90 px-0.5 rounded leading-tight">
                        50/50
                      </span>
                    ) : a === 100 ? (
                      <span className="text-[8px] font-bold text-red-300 bg-slate-950/90 px-0.5 rounded leading-tight">
                        ALL-IN
                      </span>
                    ) : a > 0 && a < 100 ? (
                      <span className="text-[8px] font-bold text-red-300 bg-slate-950/90 px-0.5 rounded leading-tight">
                        {a}% AI
                      </span>
                    ) : r > 0 && r < 100 ? (
                      <span className="text-[8px] font-bold text-white bg-slate-950/90 px-0.5 rounded leading-tight">
                        {r}%
                      </span>
                    ) : c > 0 && c < 100 ? (
                      <span className="text-[8px] font-bold text-emerald-300 bg-slate-950/90 px-0.5 rounded leading-tight">
                        {c}%
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Columna Derecha: Inspector & Ajuste Fino */}
      <div className="xl:col-span-4 flex flex-col gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">
                Inspector de Mano
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-black text-white font-mono">
                  {selectedHand}
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {getHandCombos(selectedHand)} combos
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Posición</span>
              <span className="text-sm font-bold text-emerald-400">
                {scenario.heroPos}
                {scenario.villainPos ? ` vs ${scenario.villainPos}` : " (RFI)"}
              </span>
            </div>
          </div>

          {/* Frecuencias Actuales de la Mano Seleccionada */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Frecuencia Actual</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {activeGto.allIn ? `${activeGto.allIn}% AI · ` : ""}
                  {activeGto.raise}% Raise · {activeGto.call}% Call · {activeGto.fold}% Fold
                </span>
              </div>

              {/* Barra segmentada */}
              <div className="w-full h-5 rounded-lg overflow-hidden flex bg-slate-950 border border-slate-800">
                {(activeGto.allIn || 0) > 0 && (
                  <div
                    style={{ width: `${activeGto.allIn}%` }}
                    className="bg-red-950 text-[10px] font-bold text-red-200 flex items-center justify-center border-r border-red-800"
                  >
                    AI {activeGto.allIn}%
                  </div>
                )}
                {activeGto.raise > 0 && (
                  <div
                    style={{ width: `${activeGto.raise}%` }}
                    className="bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center"
                  >
                    {activeGto.raise >= 20 ? `R ${activeGto.raise}%` : ""}
                  </div>
                )}
                {activeGto.call > 0 && (
                  <div
                    style={{ width: `${activeGto.call}%` }}
                    className="bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center"
                  >
                    {activeGto.call >= 20 ? `C ${activeGto.call}%` : ""}
                  </div>
                )}
                {activeGto.fold > 0 && (
                  <div
                    style={{ width: `${activeGto.fold}%` }}
                    className="bg-slate-950 text-[10px] font-bold text-slate-500 flex items-center justify-center"
                  >
                    {activeGto.fold >= 20 ? `F ${activeGto.fold}%` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* Ajuste Manual Completo en Modo Edición */}
            {isEditing && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  Ajustar Acciones para {selectedHand}:
                </span>

                {/* Acciones Puras Directas */}
                <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
                  <button
                    onClick={() => applyBrushToHand(selectedHand, "RAISE_100")}
                    className="py-1 rounded bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    100% R
                  </button>
                  <button
                    onClick={() => applyBrushToHand(selectedHand, "CALL_100")}
                    className="py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    100% C
                  </button>
                  <button
                    onClick={() => applyBrushToHand(selectedHand, "ALLIN_100")}
                    className="py-1 rounded bg-red-950 hover:bg-red-900 text-red-200 border border-red-700"
                  >
                    100% AI
                  </button>
                  <button
                    onClick={() => applyBrushToHand(selectedHand, "FOLD_100")}
                    className="py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-700"
                  >
                    0% Fold
                  </button>
                </div>

                {/* Combinaciones Mixtas Más Usadas */}
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block pt-1">
                  Combinaciones Mixtas (50% / 50%):
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    onClick={() => applyBrushToHand(selectedHand, "ALLIN_50_RAISE_50")}
                    className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-red-300 font-bold border border-red-800/80 text-left"
                  >
                    🍷 50% All-In / 50% Raise
                  </button>
                  <button
                    onClick={() => applyBrushToHand(selectedHand, "RAISE_50_CALL_50")}
                    className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold border border-indigo-500/50 text-left"
                  >
                    🔴 50% Raise / 50% Call
                  </button>
                  <button
                    onClick={() => applyBrushToHand(selectedHand, "ALLIN_50_CALL_50")}
                    className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold border border-amber-600/50 text-left"
                  >
                    🍷 50% All-In / 50% Call
                  </button>
                  <button
                    onClick={() => applyBrushToHand(selectedHand, "ALLIN_50_FOLD_50")}
                    className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 text-left"
                  >
                    🍷 50% All-In / 50% Fold
                  </button>
                  <button
                    onClick={() => applyBrushToHand(selectedHand, "RAISE_50_FOLD_50")}
                    className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold border border-slate-700 text-left"
                  >
                    🔴 50% Raise / 50% Fold
                  </button>
                  <button
                    onClick={() => applyBrushToHand(selectedHand, "CALL_50_FOLD_50")}
                    className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold border border-slate-700 text-left"
                  >
                    🟢 50% Call / 50% Fold
                  </button>
                </div>

                {/* Sliders / Inputs Libres para porcentajes exactos */}
                <div className="pt-2 border-t border-slate-800 space-y-2 bg-slate-950 p-2.5 rounded-lg border">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Porcentajes Libres para {selectedHand}:
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-red-400 block mb-0.5 font-bold">
                        All-In (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        value={activeGto.allIn || 0}
                        onChange={(e) =>
                          setExactHandFrequencies(
                            selectedHand,
                            Number(e.target.value) || 0,
                            activeGto.raise,
                            activeGto.call
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-rose-400 block mb-0.5 font-bold">
                        Raise (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        value={activeGto.raise || 0}
                        onChange={(e) =>
                          setExactHandFrequencies(
                            selectedHand,
                            activeGto.allIn || 0,
                            Number(e.target.value) || 0,
                            activeGto.call
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-emerald-400 block mb-0.5 font-bold">
                        Call (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        value={activeGto.call || 0}
                        onChange={(e) =>
                          setExactHandFrequencies(
                            selectedHand,
                            activeGto.allIn || 0,
                            activeGto.raise,
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Guía Rápida */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Info className="w-4 h-4 text-amber-400" />
            <span>Opciones de Edición Disponibles</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ahora tienes cubiertas <strong>todas las opciones posibles</strong>:
            All-In puro, Raise puro, Call puro, cualquier combinación mixta
            (All-In + Raise, Raise + Call, etc.) y un modo de{" "}
            <strong>porcentajes libres</strong> para ajustar cualquier mano al
            milímetro.
          </p>
        </div>
      </div>
    </div>
  );
}
