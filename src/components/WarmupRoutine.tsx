"use client";

import React, { useState, useEffect } from "react";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCw,
  Layers,
  Zap,
  Activity,
  Database,
  Flame,
} from "lucide-react";
import { Pt4DatabaseSummary } from "@/data/pt4Analytics";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  {
    id: "item-1",
    label: "Celular en silencio / Modo no molestar y redes cerradas",
    completed: false,
  },
  {
    id: "item-2",
    label: "Botella de agua o hidratación lista en el escritorio",
    completed: false,
  },
  {
    id: "item-3",
    label: "Poker Tracker 4 y HUD abiertos y sincronizados",
    completed: false,
  },
  {
    id: "item-4",
    label: "Aceptación de la varianza: enfocado 100% en decisiones EV+",
    completed: false,
  },
  {
    id: "item-5",
    label: "Respetar sizings de rolleo (4bb + 1bb/limper) vs recreacionales",
    completed: false,
  },
  {
    id: "item-6",
    label: "Diferenciar 3-bet pots IP vs OOP: agredir IP y disciplina OOP",
    completed: false,
  },
  {
    id: "item-7",
    label: "Compromiso de respetar el Stop-Loss y parar si hay fatiga",
    completed: false,
  },
];

const STORAGE_ITEMS_KEY = "ist-coach-warmup-items-v3";
const STORAGE_SESSION_KEY = "ist-coach-warmup-session-v1";

interface WarmupRoutineProps {
  dbSummary?: Pt4DatabaseSummary;
  onOpenDbModal?: () => void;
}

export default function WarmupRoutine({
  dbSummary,
  onOpenDbModal,
}: WarmupRoutineProps) {
  // Checklist
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_ITEMS);
  const [newItemText, setNewItemText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Sesión en vivo y Cronómetro
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Parámetros sincronizados con PT4
  const [activeTables, setActiveTables] = useState<number>(4);
  const [tableSpeed, setTableSpeed] = useState<"REGULAR" | "ZOOM">("REGULAR");
  const [handsCount, setHandsCount] = useState<number>(0);

  // Cargar checklist de localStorage
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(STORAGE_ITEMS_KEY);
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }

      const savedSession = localStorage.getItem(STORAGE_SESSION_KEY);
      if (savedSession) {
        const parsedS = JSON.parse(savedSession);
        if (parsedS.activeTables) setActiveTables(parsedS.activeTables);
        if (parsedS.tableSpeed) setTableSpeed(parsedS.tableSpeed);
      }
    } catch {
      // Ignorar errores de parsing
    }
  }, []);

  function saveItems(newItems: ChecklistItem[]) {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(newItems));
    } catch {
      // Ignorar
    }
  }

  function saveSessionSettings(tables: number, speed: "REGULAR" | "ZOOM") {
    try {
      localStorage.setItem(
        STORAGE_SESSION_KEY,
        JSON.stringify({ activeTables: tables, tableSpeed: speed })
      );
    } catch {
      // Ignorar
    }
  }

  // Cronómetro y conteo de manos
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prevSecs) => {
          const nextSecs = prevSecs + 1;
          // Ritmo teórico según tipo de mesa (Regular ~80 h/h/mesa, Zoom ~240 h/h/mesa)
          const baseRatePerTable = tableSpeed === "ZOOM" ? 240 : 80;
          const handsPerSecond = (baseRatePerTable * activeTables) / 3600;

          // Incremento acumulado suave
          if (nextSecs % 3 === 0) {
            setHandsCount((h) => Math.round(handsPerSecond * nextSecs));
          }
          return nextSecs;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTables, tableSpeed]);

  // Formato HH:MM:SS
  function formatLargeTime(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return {
      hours: h.toString().padStart(2, "0"),
      minutes: m.toString().padStart(2, "0"),
      seconds: s.toString().padStart(2, "0"),
    };
  }

  // Manos por hora calculadas en vivo
  const calculatedHandsPerHour =
    timerSeconds > 10 && handsCount > 0
      ? Math.round((handsCount / (timerSeconds / 3600)))
      : activeTables * (tableSpeed === "ZOOM" ? 240 : 80);

  function toggleItem(id: string) {
    const next = items.map((it) =>
      it.id === id ? { ...it, completed: !it.completed } : it
    );
    saveItems(next);
  }

  function addItem() {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      label: newItemText.trim(),
      completed: false,
    };
    saveItems([...items, newItem]);
    setNewItemText("");
  }

  function deleteItem(id: string) {
    const next = items.filter((it) => it.id !== id);
    saveItems(next);
    if (editingId === id) setEditingId(null);
  }

  function startEditing(item: ChecklistItem) {
    setEditingId(item.id);
    setEditingText(item.label);
  }

  function saveEditing() {
    if (!editingId) return;
    if (!editingText.trim()) {
      deleteItem(editingId);
      return;
    }
    const next = items.map((it) =>
      it.id === editingId ? { ...it, label: editingText.trim() } : it
    );
    saveItems(next);
    setEditingId(null);
    setEditingText("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingText("");
  }

  function uncheckAll() {
    const next = items.map((it) => ({ ...it, completed: false }));
    saveItems(next);
  }

  function restoreDefaults() {
    if (
      window.confirm(
        "¿Quieres restablecer la lista a los ítems recomendados por defecto?"
      )
    ) {
      saveItems(DEFAULT_ITEMS);
    }
  }

  function resetSession() {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setHandsCount(0);
  }

  function handleSetTables(val: number) {
    const clamped = Math.max(1, Math.min(val, 16));
    setActiveTables(clamped);
    saveSessionSettings(clamped, tableSpeed);
  }

  function handleSetSpeed(speed: "REGULAR" | "ZOOM") {
    setTableSpeed(speed);
    saveSessionSettings(activeTables, speed);
  }

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const { hours, minutes, seconds } = formatLargeTime(timerSeconds);

  return (
    <div className="w-full space-y-6">
      {/* Grid Principal en 2 Columnas alineadas al ancho total */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Reloj Principal Gigante & Métricas PT4 (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card del Reloj Principal Gigante */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
            {/* Glow de fondo */}
            <div
              className={`absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
                isTimerRunning ? "bg-emerald-500" : "bg-indigo-500"
              }`}
            />

            {/* Encabezado del Reloj */}
            <div className="w-full flex items-center justify-between mb-4 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Reloj de Sesión
                </span>
              </div>

              {isTimerRunning ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Sesión en Vivo
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  En pausa
                </span>
              )}
            </div>

            {/* Display Gigante del Tiempo */}
            <div className="my-6 z-10">
              <div className="flex items-baseline justify-center font-mono font-black text-white tracking-tight">
                <span className="text-6xl sm:text-7xl md:text-8xl drop-shadow-md">
                  {hours}
                </span>
                <span className="text-4xl sm:text-5xl md:text-6xl text-slate-500 px-1">
                  :
                </span>
                <span className="text-6xl sm:text-7xl md:text-8xl drop-shadow-md text-emerald-400">
                  {minutes}
                </span>
                <span className="text-4xl sm:text-5xl md:text-6xl text-slate-500 px-1">
                  :
                </span>
                <span className="text-5xl sm:text-6xl md:text-7xl text-slate-300">
                  {seconds}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium px-4 mt-2">
                <span>HORAS</span>
                <span>MINUTOS</span>
                <span>SEGUNDOS</span>
              </div>
            </div>

            {/* Botones de Control del Reloj */}
            <div className="flex items-center gap-3 w-full max-w-md z-10 pt-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all ${
                  isTimerRunning
                    ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30"
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pausar Sesión</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>

              <button
                onClick={resetSession}
                title="Reiniciar reloj y contador de sesión"
                className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            </div>
          </div>

          {/* Card de Métricas en Vivo & Sincronización PT4 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Métricas de Sesión & Sincronización PT4
                </h3>
              </div>

              {/* Pill de conexión con PT4 */}
              <button
                onClick={onOpenDbModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-medium text-slate-300 transition-colors"
                title="Ver detalles de conexión Poker Tracker"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {dbSummary?.source === "POSTGRES_LIVE"
                    ? `PT4 Live: ${dbSummary.playerName}`
                    : "PT4 Conectado"}
                </span>
              </button>
            </div>

            {/* Grid de 2 Métricas Principales: Manos/Hora y Cantidad de Mesas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tarjeta 1: Manos por Hora */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Manos / Hora
                  </span>
                  <span className="text-[10px] text-slate-400">Ritmo PT4</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                    {calculatedHandsPerHour.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-amber-400">
                    h / hr
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Total en sesión:</span>
                  <strong className="text-slate-200 font-mono">
                    {handsCount.toLocaleString()} manos
                  </strong>
                </div>
              </div>

              {/* Tarjeta 2: Cantidad de Mesas Jugando */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Mesas Jugando
                  </span>
                  <span className="text-[10px] text-slate-400">Activas</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                      {activeTables}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      mesas
                    </span>
                  </div>

                  {/* Controles para sumar/restar mesas */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => handleSetTables(activeTables - 1)}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center transition-colors"
                      title="Quitar una mesa"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleSetTables(activeTables + 1)}
                      className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center transition-colors"
                      title="Agregar una mesa"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Accesos rápidos de mesas */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[2, 4, 6, 8].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleSetTables(n)}
                      className={`flex-1 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        activeTables === n
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-400"
                      }`}
                    >
                      {n} mesas
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selector de formato de mesas */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400">Velocidad de mesa:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => handleSetSpeed("REGULAR")}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    tableSpeed === "REGULAR"
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Regular (~80 h/m)
                </button>
                <button
                  onClick={() => handleSetSpeed("ZOOM")}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    tableSpeed === "ZOOM"
                      ? "bg-slate-800 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Fast-Fold (~240 h/m)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Checklist de Warm-up 100% Editable (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            {/* Encabezado del Checklist */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  Warm-up Pre-sesión
                </h2>
                <span className="text-xs text-slate-400 font-mono ml-2">
                  ({completedCount}/{totalCount} listos)
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={uncheckAll}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Desmarcar todos
                </button>
                <span className="text-slate-700">·</span>
                <button
                  onClick={restoreDefaults}
                  className="text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
                  title="Restaurar lista base recomendada"
                >
                  <RotateCw className="w-3 h-3" /> Restaurar base
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  completedCount === totalCount
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
                style={{
                  width: `${
                    totalCount > 0 ? (completedCount / totalCount) * 100 : 0
                  }%`,
                }}
              />
            </div>

            {/* Lista de Ítems Editables */}
            <div className="space-y-2.5">
              {items.map((item) => {
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                      item.completed
                        ? "bg-slate-950/40 border-slate-800/50"
                        : "bg-slate-950/90 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    {/* Contenido / Modo edición */}
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditing();
                            if (e.key === "Escape") cancelEditing();
                          }}
                          className="flex-1 bg-slate-900 border border-indigo-500 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={saveEditing}
                          className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                          title="Guardar"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => toggleItem(item.id)}
                        className="flex-1 cursor-pointer min-w-0"
                      >
                        <p
                          className={`text-xs sm:text-sm leading-relaxed ${
                            item.completed
                              ? "line-through text-slate-400"
                              : "text-slate-200"
                          }`}
                        >
                          {item.label}
                        </p>
                      </div>
                    )}

                    {/* Acciones del ítem (Editar / Borrar) */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(item);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-400 transition-colors rounded hover:bg-slate-900"
                          title="Editar texto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors rounded hover:bg-slate-900"
                          title="Eliminar ítem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Input para agregar nuevo ítem */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                }}
                placeholder="+ Escribe un nuevo punto para tu rutina..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
              <button
                onClick={addItem}
                disabled={!newItemText.trim()}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs sm:text-sm font-medium text-white flex items-center gap-1.5 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
