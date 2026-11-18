"use client";

import React, { useState } from "react";
import { Calculator, Percent, ShieldCheck, Zap, Info } from "lucide-react";

export default function OddsCalculator() {
  // Pot Odds
  const [potSize, setPotSize] = useState<number>(10);
  const [betToCall, setBetToCall] = useState<number>(5);

  // Bluff Breakeven
  const [bluffPotSize, setBluffPotSize] = useState<number>(10);
  const [bluffBetSize, setBluffBetSize] = useState<number>(6.6);

  // SPR
  const [effectiveStack, setEffectiveStack] = useState<number>(95);
  const [flopPot, setFlopPot] = useState<number>(9);

  // Pot Odds Calculation: betToCall / (potSize + betToCall)
  const totalPotAfterCall = potSize + betToCall;
  const potOddsPercent = totalPotAfterCall > 0 ? (betToCall / totalPotAfterCall) * 100 : 0;
  const ratio = betToCall > 0 ? (potSize / betToCall).toFixed(1) : "0";

  // Bluff Breakeven: Risk / (Risk + Reward) = bluffBetSize / (bluffPotSize + bluffBetSize)
  const totalBluffPool = bluffPotSize + bluffBetSize;
  const bluffBreakevenPercent = totalBluffPool > 0 ? (bluffBetSize / totalBluffPool) * 100 : 0;

  // SPR: effectiveStack / flopPot
  const sprValue = flopPot > 0 ? effectiveStack / flopPot : 0;

  function getSprCategory(spr: number) {
    if (spr <= 3) {
      return {
        label: "SPR Bajo (Commitment)",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        advice: "Top Pair con buen kicker y Overpairs son suficientes para jugar por stacks. Faroles tienen poco fold equity.",
      };
    }
    if (spr <= 8) {
      return {
        label: "SPR Medio (Manejo de Bote)",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        advice: "Top Pair pierde valor en calles avanzadas ante agresión múltiple. Juega 2 calles de valor y controla el bote.",
      };
    }
    return {
      label: "SPR Alto / Deep (Nut Advantage)",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      advice: "Prioriza manos que conectan Nuts (sets, proyectos a color nut, escaleras). Evita sobre-pagar con una sola pareja.",
    };
  }

  const sprCategory = getSprCategory(sprValue);

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Calculadora Rápida de Odds & SPR</h1>
        <p className="text-xs text-slate-400 mt-1">
          Herramienta matemática instantánea para calcular Pot Odds, Breakeven de faroles y Stack-to-Pot Ratio (SPR).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Pot Odds */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Percent className="w-4 h-4 text-emerald-400" />
              <span>Pot Odds (Para Pagar)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Call EV</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Tamaño del Bote (BB o $)</label>
              <input
                type="number"
                min={0.1}
                step={0.5}
                value={potSize}
                onChange={(e) => setPotSize(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Apuesta a Pagar (BB o $)</label>
              <input
                type="number"
                min={0.1}
                step={0.5}
                value={betToCall}
                onChange={(e) => setBetToCall(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Resultado Pot Odds */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
            <div className="text-3xl font-black font-mono text-emerald-400">
              {potOddsPercent.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">
              Equity mínima requerida ({ratio}:1)
            </div>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              Si tu mano gana al menos el <strong>{potOddsPercent.toFixed(1)}%</strong> de las veces, el call es rentable.
            </p>
          </div>
        </div>

        {/* 2. Breakeven de Farol */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Breakeven de Farol</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Bluff EV</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Bote Actual (BB o $)</label>
              <input
                type="number"
                min={0.1}
                step={0.5}
                value={bluffPotSize}
                onChange={(e) => setBluffPotSize(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Tu Apuesta de Farol (BB o $)</label>
              <input
                type="number"
                min={0.1}
                step={0.5}
                value={bluffBetSize}
                onChange={(e) => setBluffBetSize(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Resultado Breakeven */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
            <div className="text-3xl font-black font-mono text-amber-400">
              {bluffBreakevenPercent.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">
              Fold Equity mínima requerida
            </div>
            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              El rival debe foldear más del <strong>{bluffBreakevenPercent.toFixed(1)}%</strong> para que el farol puro tenga EV+.
            </p>
          </div>
        </div>

        {/* 3. SPR en Flop */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-white text-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Stack-to-Pot Ratio (SPR)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Postflop</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Stack Efectivo en Flop (BB)</label>
              <input
                type="number"
                min={1}
                step={5}
                value={effectiveStack}
                onChange={(e) => setEffectiveStack(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Bote en Flop (BB)</label>
              <input
                type="number"
                min={1}
                step={1}
                value={flopPot}
                onChange={(e) => setFlopPot(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Resultado SPR */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
            <div className="text-3xl font-black font-mono text-white">
              SPR {sprValue.toFixed(1)}
            </div>
            <div className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${sprCategory.color}`}>
              {sprCategory.label}
            </div>
            <p className="text-[11px] text-slate-400 pt-1 leading-relaxed text-left">
              {sprCategory.advice}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla rápida de Regla del 2 y del 4 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Referencia Rápida: Regla del 2 y 4 (Outs a Equity)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Proyecto a Color</span>
            <strong className="text-white text-base font-mono">9 Outs</strong>
            <span className="text-emerald-400 block text-[11px] mt-0.5">~36% Turn+River (18% Turn)</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Escalera Abierta (OESD)</span>
            <strong className="text-white text-base font-mono">8 Outs</strong>
            <span className="text-emerald-400 block text-[11px] mt-0.5">~32% Turn+River (16% Turn)</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Gutshot (Escalera interna)</span>
            <strong className="text-white text-base font-mono">4 Outs</strong>
            <span className="text-emerald-400 block text-[11px] mt-0.5">~16% Turn+River (8% Turn)</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Monstruo (Color + OESD)</span>
            <strong className="text-white text-base font-mono">15 Outs</strong>
            <span className="text-emerald-400 block text-[11px] mt-0.5">~54% Favorito al Showdown</span>
          </div>
        </div>
      </div>
    </div>
  );
}
