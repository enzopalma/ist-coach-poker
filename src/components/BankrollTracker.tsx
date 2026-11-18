"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  TrendingUp,
  AlertOctagon,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  CheckCircle2,
} from "lucide-react";

interface StakeConfig {
  id: string;
  name: string;
  bbValue: number; // en USD
  minBankrollBb: number; // 35 cajas
  shotTakeBb: number; // 50 cajas
  moveDownBb: number; // 25 cajas
}

const STAKES: StakeConfig[] = [
  { id: "NL2", name: "NL2 ($0.01 / $0.02)", bbValue: 0.02, minBankrollBb: 3500, shotTakeBb: 5000, moveDownBb: 2500 },
  { id: "NL5", name: "NL5 ($0.02 / $0.05)", bbValue: 0.05, minBankrollBb: 3500, shotTakeBb: 5000, moveDownBb: 2500 },
  { id: "NL10", name: "NL10 ($0.05 / $0.10)", bbValue: 0.10, minBankrollBb: 3500, shotTakeBb: 5000, moveDownBb: 2500 },
  { id: "NL25", name: "NL25 ($0.10 / $0.25)", bbValue: 0.25, minBankrollBb: 3500, shotTakeBb: 5000, moveDownBb: 2500 },
  { id: "NL50", name: "NL50 ($0.25 / $0.50)", bbValue: 0.50, minBankrollBb: 4000, shotTakeBb: 6000, moveDownBb: 3000 },
  { id: "NL100", name: "NL100 ($0.50 / $1.00)", bbValue: 1.00, minBankrollBb: 4000, shotTakeBb: 6000, moveDownBb: 3000 },
];

const STORAGE_KEY = "ist-coach-bankroll-v1";

export default function BankrollTracker() {
  const [currentStakeId, setCurrentStakeId] = useState<string>("NL10");
  const [bankrollUsd, setBankrollUsd] = useState<number>(450);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentStakeId) setCurrentStakeId(parsed.currentStakeId);
        if (typeof parsed.bankrollUsd === "number") setBankrollUsd(parsed.bankrollUsd);
      }
    } catch {
      // Ignorar
    }
  }, []);

  function saveBankroll(stakeId: string, amount: number) {
    setCurrentStakeId(stakeId);
    setBankrollUsd(amount);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStakeId: stakeId, bankrollUsd: amount }));
    } catch {
      // Ignorar
    }
  }

  const currentStake = STAKES.find((s) => s.id === currentStakeId) || STAKES[2];
  const buyinUsd = currentStake.bbValue * 100;
  const buyinsCount = buyinUsd > 0 ? bankrollUsd / buyinUsd : 0;

  // Siguiente nivel y nivel anterior
  const currentIndex = STAKES.findIndex((s) => s.id === currentStakeId);
  const nextStake = currentIndex < STAKES.length - 1 ? STAKES[currentIndex + 1] : null;
  const prevStake = currentIndex > 0 ? STAKES[currentIndex - 1] : null;

  const nextStakeBuyinUsd = nextStake ? nextStake.bbValue * 100 : buyinUsd;
  const nextStakeBuyinsHave = nextStake ? bankrollUsd / nextStakeBuyinUsd : 0;
  const shotTargetUsd = nextStake ? nextStakeBuyinUsd * 40 : bankrollUsd * 1.5;

  const progressToShotPercent = Math.min(
    100,
    Math.max(0, Math.round((bankrollUsd / shotTargetUsd) * 100))
  );

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Gestión de Banca & Subida de Niveles</h1>
        <p className="text-xs text-slate-400 mt-1">
          Reglas matemáticas estrictas para proteger tu capital de la varianza y saber exactamente cuándo subir o bajar de límite.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Panel de Configuración y Estado Actual (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <span className="text-sm font-semibold text-white block">Tu Banca Actual</span>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nivel que estás jugando</label>
              <select
                value={currentStakeId}
                onChange={(e) => saveBankroll(e.target.value, bankrollUsd)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                {STAKES.map((stk) => (
                  <option key={stk.id} value={stk.id}>
                    {stk.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Saldo Total de Banca ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  min={1}
                  step={10}
                  value={bankrollUsd}
                  onChange={(e) => saveBankroll(currentStakeId, Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-base text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta de Cajas Disponibles */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Cajas Disponibles en {currentStake.id}
            </div>
            <div className="text-4xl font-black font-mono text-emerald-400">
              {buyinsCount.toFixed(1)} <span className="text-sm font-normal text-slate-400">cajas (100bb)</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Valor de caja: <strong>${buyinUsd.toFixed(2)} USD</strong> (1 caja = 100 ciegas grandes).
            </p>
          </div>

          {/* Alertas de Salud de Banca */}
          {buyinsCount < 25 ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>Alerta Crítica:</strong> Tienes menos de 25 cajas en {currentStake.id}. El riesgo de bancarrota por varianza natural es elevado.{" "}
                {prevStake && <span>Se recomienda bajar inmediatamente a <strong>{prevStake.id}</strong> para recuperar saldo.</span>}
              </div>
            </div>
          ) : buyinsCount >= 40 ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Banca Sólida:</strong> Dispones de más de 40 cajas. Tu banca tolera swings y estás en condiciones óptimas para planificar tiros (shots) al siguiente límite.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Banca Estándar (25 - 40 cajas):</strong> Mantén disciplina estricta. Si bajas de 25 cajas, baja de nivel; no intentes recuperar pérdidas rápido.
              </div>
            </div>
          )}
        </div>

        {/* Panel de Metas & Reglas de Shot-Taking (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <span className="text-sm font-semibold text-white block">Plan de Escalada y Protección</span>

          {/* Progreso hacia el siguiente nivel */}
          {nextStake && (
            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  Meta para Shot en {nextStake.id} ({nextStake.name})
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {progressToShotPercent}%
                </span>
              </div>

              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${progressToShotPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Actual: ${bankrollUsd} ({nextStakeBuyinsHave.toFixed(1)} cajas de {nextStake.id})</span>
                <span>Objetivo: ${shotTargetUsd} (40 cajas)</span>
              </div>
            </div>
          )}

          {/* Reglas de Oro de Gestión de Banca */}
          <div className="space-y-2.5 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] block">
              Reglas Estándar para Cash 6-Max
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Regla de Subida (Shot-Taking)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Cuando alcances <strong>40-50 cajas</strong> del nivel superior, toma un shot de <strong>4 a 5 cajas</strong>. Si pierdes esas 5 cajas, bajas de inmediato sin culpa.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-rose-400 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Regla de Bajada (Stop-Loss de Nivel)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Si tu banca cae por debajo de <strong>25 cajas</strong> en tu nivel habitual, baja de límite de inmediato. Bajar de nivel no es fracaso: es supervivencia y protección de capital.
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de Referencia de Niveles */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 font-semibold block mb-2">Tabla de Requerimientos Recomendados</span>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Límite</th>
                    <th className="py-2 px-3">Caja (100bb)</th>
                    <th className="py-2 px-3">Banca Mínima (35 cajas)</th>
                    <th className="py-2 px-3">Shot al siguiente (50 cajas)</th>
                    <th className="py-2 px-3">Bajar si caes a</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {STAKES.map((stk) => {
                    const box = stk.bbValue * 100;
                    const isSelected = stk.id === currentStakeId;
                    return (
                      <tr key={stk.id} className={isSelected ? "bg-indigo-950/20 text-white font-bold" : "text-slate-300"}>
                        <td className="py-2 px-3">{stk.id}</td>
                        <td className="py-2 px-3">${box.toFixed(2)}</td>
                        <td className="py-2 px-3 text-emerald-400">${(box * 35).toFixed(0)}</td>
                        <td className="py-2 px-3 text-indigo-400">${(box * 50).toFixed(0)}</td>
                        <td className="py-2 px-3 text-rose-400">${(box * 25).toFixed(0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
