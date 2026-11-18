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
  Layers,
  Edit3,
  Save,
  RotateCcw,
  Trash2,
  Check,
  X,
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
type BrushMode = "FULL" | "HALF" | "EMPTY"; // 100% | 50% | 0%
type BrushAction = "RAISE" | "CALL";

export default function RangeMatrix13x13({
  scenario,
  onSaveOverride,
  onResetOverride,
  isOverridden,
}: RangeMatrix13x13Props) {
  const [viewMode, setViewMode] = useState<MatrixViewMode>("GTO");
  const [filter, setFilter] = useState<HandFilter>("ALL");
  const [selectedHand, setSelectedHand] = useState<string>("A5s");

  // Modo Editor Interactivo
  const [isEditing, setIsEditing] = useState(false);
  const [localFreqs, setLocalFreqs] = useState<Frequencies>({});
  const [brushMode, setBrushMode] = useState<BrushMode>("FULL");
  const [brushAction, setBrushAction] = useState<BrushAction>("RAISE");
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inicializar o sincronizar frecuencias locales cuando cambia el spot o inicia edición
  useEffect(() => {
    setLocalFreqs({ ...scenario.frequencies });
    setIsEditing(false);
  }, [scenario.id, scenario.frequencies]);

  // Manejar mouse up global para drag-to-paint
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
        empty[h] = { raise: 0, call: 0, fold: 100 };
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

  // Pintar una celda según el pincel (100% Lleno, 50% Mitad, 0% Borrar)
  function applyBrushToHand(hand: string) {
    if (!isEditing) return;

    setLocalFreqs((prev) => {
      const next = { ...prev };
      const current = next[hand] || { raise: 0, call: 0, fold: 100 };

      if (brushMode === "FULL") {
        if (brushAction === "RAISE") {
          next[hand] = { raise: 100, call: 0, fold: 0 };
        } else {
          next[hand] = { raise: 0, call: 100, fold: 0 };
        }
      } else if (brushMode === "HALF") {
        if (brushAction === "RAISE") {
          next[hand] = { raise: 50, call: 0, fold: 50 };
        } else {
          next[hand] = { raise: 0, call: 50, fold: 50 };
        }
      } else {
        // EMPTY (0% / Fold)
        next[hand] = { raise: 0, call: 0, fold: 100 };
      }

      return next;
    });
  }

  // Alternativa: clic simple para rotar frecuencias (0% -> 50% -> 100% -> 0%) si se prefiere clic rápido
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

  // Cálculo en vivo de combos y porcentaje cuando se edita
  let livePlayedCombos = 0;
  let liveRaiseCombos = 0;
  let liveCallCombos = 0;
  for (const h of getAll169Hands()) {
    const f = currentFrequencies[h];
    if (f) {
      const c = getHandCombos(h);
      liveRaiseCombos += (c * f.raise) / 100;
      liveCallCombos += (c * f.call) / 100;
      livePlayedCombos += (c * (f.raise + f.call)) / 100;
    }
  }
  const liveTotalPct = ((livePlayedCombos / 1326) * 100).toFixed(1);
  const liveRaisePct = ((liveRaiseCombos / 1326) * 100).toFixed(1);
  const liveCallPct = ((liveCallCombos / 1326) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Columna Izquierda: Matriz Interactiva 13x13 y Barra de Editor */}
      <div className="xl:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        {/* Barra Superior: Modo Editor / Selector de Vista */}
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
            /* Controles Activos del Modo Edición */
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

              {/* Selector de Pincel (Lleno 100%, Mitad 50%, Borrar 0%) */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-900 text-xs">
                <span className="text-slate-400 font-semibold text-[11px]">Pincel:</span>

                {/* 100% Lleno */}
                <button
                  type="button"
                  onClick={() => setBrushMode("FULL")}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
                    brushMode === "FULL"
                      ? brushAction === "RAISE"
                        ? "bg-rose-600 text-white border-rose-500 shadow-sm"
                        : "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="w-3 h-3 rounded-sm bg-white/90 inline-block" />
                  <span>100% Lleno</span>
                </button>

                {/* 50% Mitad */}
                <button
                  type="button"
                  onClick={() => setBrushMode("HALF")}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
                    brushMode === "HALF"
                      ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-sm inline-block border border-white/50"
                    style={{
                      background: "linear-gradient(to right, #f43f5e 50%, #0f172a 50%)",
                    }}
                  />
                  <span>50% Mitad</span>
                </button>

                {/* 0% Borrar */}
                <button
                  type="button"
                  onClick={() => setBrushMode("EMPTY")}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
                    brushMode === "EMPTY"
                      ? "bg-slate-800 text-white border-slate-600 shadow-sm"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="w-3 h-3 rounded-sm bg-slate-950 border border-slate-700 inline-block" />
                  <span>0% Borrar (Fold)</span>
                </button>

                {/* Selector de Acción si el spot admite Call */}
                <div className="flex items-center gap-1 pl-3 border-l border-slate-800">
                  <span className="text-slate-400 text-[11px] mr-1">Acción:</span>
                  <button
                    type="button"
                    onClick={() => setBrushAction("RAISE")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                      brushAction === "RAISE"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    Raise
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrushAction("CALL")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                      brushAction === "CALL"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    Call
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vistas de Referencia / PT4 (solo cuando no está editando) */}
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

        {/* Leyenda de Colores & Contador en Vivo */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block" />
              <span className="text-slate-300 font-medium">Raise:</span>
              <span className="text-white font-mono font-bold">
                {isEditing ? liveRaisePct : scenario.gtoSummary.raisePct}%
              </span>
            </div>

            {(isEditing ? Number(liveCallPct) > 0 : scenario.gtoSummary.callPct > 0) && (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" />
                <span className="text-slate-300 font-medium">Call:</span>
                <span className="text-white font-mono font-bold">
                  {isEditing ? liveCallPct : scenario.gtoSummary.callPct}%
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-700 inline-block" />
              <span className="text-slate-400">Total Apertura:</span>
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

        {/* Matriz 13x13 Interactiva con Drag-to-Paint */}
        <div
          className="grid grid-cols-13 gap-1 select-none"
          onMouseDown={() => setIsMouseDown(true)}
        >
          {RANKS.map((_, rowIdx) =>
            RANKS.map((__, colIdx) => {
              const hand = getHandLabel(rowIdx, colIdx);
              const gto = currentFrequencies[hand] || { raise: 0, call: 0, fold: 100 };
              const hero = scenario.pt4HeroFrequencies[hand] || {
                raise: 0,
                call: 0,
                fold: 100,
              };
              const source = viewMode === "PT4_HERO" && !isEditing ? hero : gto;
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
                      className={`text-[10px] sm:text-xs font-bold leading-none ${
                        source.raise + source.call > 15 ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {hand}
                    </span>
                    {viewMode === "DIFF" && hasDeviation && !isEditing && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>

                  {/* Frecuencia inferior */}
                  <div className="w-full flex items-center justify-between z-10">
                    {source.raise > 0 && source.raise < 100 ? (
                      <span className="text-[9px] font-bold text-white bg-slate-950/80 px-1 rounded leading-tight">
                        50%
                      </span>
                    ) : source.call > 0 && source.call < 100 ? (
                      <span className="text-[9px] font-bold text-emerald-300 bg-slate-950/80 px-1 rounded leading-tight">
                        50%
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Columna Derecha: Inspector de Mano Seleccionada y Ajustes */}
      <div className="xl:col-span-4 flex flex-col gap-5">
        {/* Hand Inspector Card */}
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

          {/* Frecuencias de la mano seleccionada */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Frecuencia Actual</span>
                <span className="text-slate-400 font-mono">
                  {activeGto.raise}% Raise · {activeGto.call}% Call · {activeGto.fold}% Fold
                </span>
              </div>
              <div className="w-full h-5 rounded-lg overflow-hidden flex bg-slate-950 border border-slate-800">
                {activeGto.raise > 0 && (
                  <div
                    style={{ width: `${activeGto.raise}%` }}
                    className="bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center"
                  >
                    {activeGto.raise >= 25 ? `R ${activeGto.raise}%` : ""}
                  </div>
                )}
                {activeGto.call > 0 && (
                  <div
                    style={{ width: `${activeGto.call}%` }}
                    className="bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center"
                  >
                    {activeGto.call >= 25 ? `C ${activeGto.call}%` : ""}
                  </div>
                )}
                {activeGto.fold > 0 && (
                  <div
                    style={{ width: `${activeGto.fold}%` }}
                    className="bg-slate-950 text-[10px] font-bold text-slate-500 flex items-center justify-center"
                  >
                    {activeGto.fold >= 25 ? `F ${activeGto.fold}%` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* Si está en modo edición, botones rápidos para la mano seleccionada */}
            {isEditing && (
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Asignar a {selectedHand}:</span>
                <button
                  onClick={() => {
                    setBrushMode("FULL");
                    applyBrushToHand(selectedHand);
                  }}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  100% Lleno
                </button>
                <button
                  onClick={() => {
                    setBrushMode("HALF");
                    applyBrushToHand(selectedHand);
                  }}
                  className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  50% Mitad
                </button>
                <button
                  onClick={() => {
                    setBrushMode("EMPTY");
                    applyBrushToHand(selectedHand);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  0% Fold
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Claves del Spot */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Info className="w-4 h-4 text-rose-400" />
            <span>Guía de Referencia ({scenario.shortTitle})</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Puedes editar cualquier celda de la tabla seleccionando <strong>100% Lleno</strong> o{" "}
            <strong>50% Mitad</strong>. Los cambios se guardan permanentemente en tu navegador al hacer clic en{" "}
            <strong>Guardar Tabla</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
