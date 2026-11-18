"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertTriangle,
  History,
  Trash2,
  Save,
  Smile,
  Meh,
  Frown,
} from "lucide-react";

export interface CooldownRecord {
  id: string;
  date: string;
  gameQuality: "A_GAME" | "B_GAME" | "C_GAME";
  respectedPlan: boolean;
  bbResult: number;
  durationMinutes: number;
  notes: string;
}

const STORAGE_KEY = "ist-coach-cooldown-history-v1";

export default function SessionCooldown() {
  const [history, setHistory] = useState<CooldownRecord[]>([]);

  // Formulario actual
  const [gameQuality, setGameQuality] = useState<"A_GAME" | "B_GAME" | "C_GAME">("A_GAME");
  const [respectedPlan, setRespectedPlan] = useState<boolean>(true);
  const [bbResult, setBbResult] = useState<number | "">("");
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [notes, setNotes] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {
      // Ignorar error
    }
  }, []);

  function saveRecord(e: React.FormEvent) {
    e.preventDefault();

    const record: CooldownRecord = {
      id: `cool-${Date.now()}`,
      date: new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      gameQuality,
      respectedPlan,
      bbResult: typeof bbResult === "number" ? bbResult : 0,
      durationMinutes,
      notes: notes.trim(),
    };

    const next = [record, ...history];
    setHistory(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignorar
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    setNotes("");
    setBbResult("");
  }

  function deleteRecord(id: string) {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignorar
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Cool-down Post-Sesión</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cierre mental de 1 minuto al apagar las mesas: evalúa la calidad de tus decisiones y desconéctate sin arrastrar tilt.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulario de Cierre (5 cols) */}
        <form onSubmit={saveRecord} className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Evaluación de Sesión</span>
            {savedSuccess && (
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> ¡Guardado!
              </span>
            )}
          </div>

          {/* Calidad de Juego */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-2">Nivel de Juego Desarrollado</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGameQuality("A_GAME")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                  gameQuality === "A_GAME"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <Smile className="w-4 h-4 text-emerald-400" />
                <span>A-Game</span>
              </button>

              <button
                type="button"
                onClick={() => setGameQuality("B_GAME")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                  gameQuality === "B_GAME"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <Meh className="w-4 h-4 text-amber-400" />
                <span>B-Game</span>
              </button>

              <button
                type="button"
                onClick={() => setGameQuality("C_GAME")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex flex-col items-center gap-1 transition-all ${
                  gameQuality === "C_GAME"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <Frown className="w-4 h-4 text-rose-400" />
                <span>C-Game</span>
              </button>
            </div>
          </div>

          {/* Cumplimiento de Reglas */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1.5">¿Respetaste tu plan técnico y Stop-Loss?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRespectedPlan(true)}
                className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                  respectedPlan
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                ✓ Sí, jugué disciplinado
              </button>
              <button
                type="button"
                onClick={() => setRespectedPlan(false)}
                className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                  !respectedPlan
                    ? "bg-rose-600 text-white border-rose-500"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                ✗ No, me desvié / hubo tilt
              </button>
            </div>
          </div>

          {/* Resultado y Tiempo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Balance en BBs</label>
              <input
                type="number"
                step="1"
                value={bbResult}
                onChange={(e) => setBbResult(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="+150 o -80"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Duración (minutos)</label>
              <input
                type="number"
                min={10}
                max={480}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Reflexión o Nota */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Aprendizaje clave / Cierre mental</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Qué spot te generó dudas? ¿Qué harás diferente en la próxima sesión?"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Registrar Cierre de Sesión</span>
          </button>
        </form>

        {/* Historial de Sesiones (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <History className="w-4 h-4 text-slate-400" />
              <span>Bitácora de Sesiones Anteriores</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">{history.length} registradas</span>
          </div>

          {history.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              Aún no has registrado cierres de sesión. Al terminar tu primera sesión de juego completa el formulario de la izquierda.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {history.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.gameQuality === "A_GAME"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : rec.gameQuality === "B_GAME"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {rec.gameQuality.replace("_", " ")}
                      </span>

                      <span className="text-slate-400 text-[11px]">{rec.date}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400 text-[11px]">{rec.durationMinutes} min</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold ${
                          rec.bbResult > 0
                            ? "text-emerald-400"
                            : rec.bbResult < 0
                            ? "text-rose-400"
                            : "text-slate-400"
                        }`}
                      >
                        {rec.bbResult > 0 ? `+${rec.bbResult}` : rec.bbResult} BB
                      </span>
                      <button
                        onClick={() => deleteRecord(rec.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {rec.notes && (
                    <p className="text-xs text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 leading-relaxed">
                      {rec.notes}
                    </p>
                  )}

                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                    {rec.respectedPlan ? (
                      <span className="text-emerald-400">✓ Plan y disciplina respetados</span>
                    ) : (
                      <span className="text-rose-400">⚠ Hubo desvíos del plan de juego</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
