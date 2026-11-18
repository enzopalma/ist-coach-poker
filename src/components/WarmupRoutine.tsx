"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  CheckCircle2,
  Circle,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Target,
  ShieldAlert,
  BatteryCharging,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Brain,
  AlertTriangle,
  Smile,
  Zap,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  category: "ENTORNO" | "MENTAL" | "SOFTWARE" | "TECNICO";
  label: string;
  completed: boolean;
  isCustom?: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Entorno
  {
    id: "env-1",
    category: "ENTORNO",
    label: "Celular en silencio / Modo no molestar y redes sociales cerradas.",
    completed: false,
  },
  {
    id: "env-2",
    category: "ENTORNO",
    label: "Botella de agua o hidratación a mano en el escritorio.",
    completed: false,
  },
  {
    id: "env-3",
    category: "ENTORNO",
    label: "Ergonomía lista: silla, monitor a la altura de los ojos y postura cómoda.",
    completed: false,
  },
  // Mental
  {
    id: "men-1",
    category: "MENTAL",
    label: "Aceptación de la varianza: enfocado 100% en tomar decisiones EV+, no en la gráfica de hoy.",
    completed: false,
  },
  {
    id: "men-2",
    category: "MENTAL",
    label: "Sin apuro ni tilt residual: mente limpia de sesiones anteriores o pérdidas pasadas.",
    completed: false,
  },
  {
    id: "men-3",
    category: "MENTAL",
    label: "Compromiso de respetar el Stop-Loss y parar si detecto fatiga o C-Game.",
    completed: false,
  },
  // Software
  {
    id: "sof-1",
    category: "SOFTWARE",
    label: "Poker Tracker 4 y HUD abiertos, sincronizados y capturando manos.",
    completed: false,
  },
  {
    id: "sof-2",
    category: "SOFTWARE",
    label: "Salas de juego abiertas con banca verificada y mesas distribuidas.",
    completed: false,
  },
  // Técnico
  {
    id: "tec-1",
    category: "TECNICO",
    label: "Repasar las tablas preflop del spot principal a jugar hoy (ej. BTN RFI o BB vs BTN).",
    completed: false,
  },
  {
    id: "tec-2",
    category: "TECNICO",
    label: "Atención a pozos rolleados: aplicar tamaño adecuado (4bb + 1bb/limper) con ventaja de rango.",
    completed: false,
  },
  {
    id: "tec-3",
    category: "TECNICO",
    label: "Diferenciar 3-bet pots IP vs OOP: agredir con iniciativa IP y no sobre-defender pasivo OOP.",
    completed: false,
  },
];

const STORAGE_KEY = "ist-coach-warmup-v1";

interface WarmupData {
  items: ChecklistItem[];
  objective: string;
  maxTables: number;
  stopLossBb: number;
  sessionDurationMins: number;
  energyLevel: "BAJO" | "MEDIO" | "ALTO";
  mentalState: "CALMADO" | "CONCENTRADO" | "CANSADO" | "ANSIOSO";
  notes: string;
}

interface WarmupRoutineProps {
  onOpenPreflop?: () => void;
  onOpenLeaks?: () => void;
}

export default function WarmupRoutine({
  onOpenPreflop,
  onOpenLeaks,
}: WarmupRoutineProps) {
  const [data, setData] = useState<WarmupData>({
    items: DEFAULT_CHECKLIST,
    objective: "Tomar decisiones sólidas respetando sizings de rolleo y evitar call pasivo en river.",
    maxTables: 4,
    stopLossBb: 300,
    sessionDurationMins: 90,
    energyLevel: "ALTO",
    mentalState: "CONCENTRADO",
    notes: "",
  });

  const [newCustomText, setNewCustomText] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    "ALL" | "ENTORNO" | "MENTAL" | "SOFTWARE" | "TECNICO"
  >("ALL");

  // Timer de sesión en vivo
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Cargar de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData((prev) => ({
          ...prev,
          ...parsed,
          items: parsed.items || DEFAULT_CHECKLIST,
        }));
      }
    } catch {
      // Ignorar error de storage
    }
  }, []);

  // Guardar en localStorage
  function saveData(updated: Partial<WarmupData>) {
    setData((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  }

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  function toggleItem(id: string) {
    const updated = data.items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveData({ items: updated });
  }

  function addCustomItem() {
    if (!newCustomText.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      category: "TECNICO",
      label: newCustomText.trim(),
      completed: false,
      isCustom: true,
    };
    saveData({ items: [...data.items, newItem] });
    setNewCustomText("");
  }

  function removeCustomItem(id: string) {
    const updated = data.items.filter((item) => item.id !== id);
    saveData({ items: updated });
  }

  function resetChecklist() {
    if (
      !window.confirm(
        "¿Deseas reiniciar los checks para comenzar una nueva sesión de Warm-up?"
      )
    )
      return;
    const reset = data.items.map((it) => ({ ...it, completed: false }));
    saveData({ items: reset });
    setIsTimerRunning(false);
    setTimerSeconds(0);
  }

  // Formato MM:SS o HH:MM:SS
  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const completedCount = data.items.filter((i) => i.completed).length;
  const totalCount = data.items.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isReadyToGrind = progressPercent >= 80;

  const filteredItems = data.items.filter((i) =>
    activeCategoryFilter === "ALL" ? true : i.category === activeCategoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Banner Superior Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Rutina Pre-Sesión
              </span>
              <span className="text-xs text-slate-400">
                Asegura tu A-Game antes de abrir mesas
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Warm-up Pre-sesión
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              El 80% de los errores y pérdidas no forzadas ocurren por empezar a
              jugar frío, distraído o con tilt acumulado. Tómate 5 minutos para
              alinear tu mente, tu entorno y tu foco técnico.
            </p>
          </div>

          {/* Estado de preparación y Cronómetro de Sesión */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 shrink-0">
            {/* Medidor de preparación */}
            <div className="text-center min-w-[110px]">
              <div className="text-[11px] text-slate-400 mb-0.5">Preparación</div>
              <div
                className={`text-2xl font-bold ${
                  isReadyToGrind ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {progressPercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {completedCount} de {totalCount} listos
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800 hidden sm:block" />

            {/* Cronómetro de sesión */}
            <div className="min-w-[150px]">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3 text-indigo-400" /> Reloj de Sesión
                </span>
                {isTimerRunning && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div className="text-xl font-mono font-bold text-white mb-2">
                {formatTime(timerSeconds)}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                    isTimerRunning
                      ? "bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3 h-3" /> Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> Iniciar Sesión
                    </>
                  )}
                </button>
                <button
                  onClick={resetChecklist}
                  title="Reiniciar checks y reloj"
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              {isReadyToGrind ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-medium">
                    ¡Listo para grindear al máximo nivel!
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Completa la rutina antes de abrir tus salas de poker
                  </span>
                </>
              )}
            </span>
            <span className="text-slate-400 font-mono">
              {completedCount} / {totalCount} ítems
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isReadyToGrind ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid de 2 Columnas: Parámetros & Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Objetivos, Estado Mental y Reglas (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tarjeta de Foco Técnico y Objetivos */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Target className="w-4 h-4 text-rose-400" />
              <span>Objetivo Principal de la Sesión</span>
            </div>
            <p className="text-xs text-slate-400">
              Elige solo 1 o 2 aspectos técnicos en los que poner toda tu
              atención consciente hoy:
            </p>

            <textarea
              rows={3}
              value={data.objective}
              onChange={(e) => saveData({ objective: e.target.value })}
              placeholder="Ej: Mantener agresividad en pozos rolleados IP y no pagar river en botes 3-bet sin blockers..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition-all resize-none"
            />

            {/* Parámetros de Control */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Máximo de Mesas
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={data.maxTables}
                    onChange={(e) =>
                      saveData({ maxTables: Number(e.target.value) || 1 })
                    }
                    className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400">mesas</span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <label className="text-[11px] text-slate-400 block mb-1">
                  Duración Objetivo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={15}
                    max={360}
                    step={15}
                    value={data.sessionDurationMins}
                    onChange={(e) =>
                      saveData({
                        sessionDurationMins: Number(e.target.value) || 60,
                      })
                    }
                    className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400">minutos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Estado Emocional & Energía */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span>Nivel de Energía y Disposición</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">
                  ¿Cómo te sientes físicamente?
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["ALTO", "MEDIO", "BAJO"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => saveData({ energyLevel: lvl })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        data.energyLevel === lvl
                          ? lvl === "ALTO"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                            : lvl === "MEDIO"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/50"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      {lvl === "ALTO"
                        ? "⚡ Alto (A-Game)"
                        : lvl === "MEDIO"
                        ? "🔋 Medio"
                        : "⚠️ Bajo / Cansado"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">
                  Estado Mental
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "CONCENTRADO", label: "🎯 Concentrado" },
                      { id: "CALMADO", label: "🧘 En calma" },
                      { id: "ANSIOSO", label: "⚡ Inquieto / Rápido" },
                      { id: "CANSADO", label: "🥱 Distraído" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => saveData({ mentalState: m.id })}
                      className={`px-3 py-2 rounded-lg text-xs text-left font-medium border transition-all ${
                        data.mentalState === m.id
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {data.energyLevel === "BAJO" && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
                  ⚠️ <strong>Alerta:</strong> Con energía baja tu toma de
                  decisiones se deteriora rápidamente. Reduce el número de
                  mesas a la mitad o programa una sesión corta de 45 minutos.
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta de Mantra Mental */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-900/40 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Mantra de Desapego</span>
            </div>
            <p className="text-slate-300 italic leading-relaxed">
              &quot;Mi valor como jugador no depende del resultado de una
              sesión. Solo controlo la calidad de mis decisiones mano por mano.
              Acepto los bad beats como parte natural del juego y no busco
              revancha.&quot;
            </p>
          </div>
        </div>

        {/* Columna Derecha: Checklist Interactivo y Cheat Sheet (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Checklist Interactivo */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Checklist Pre-Sesión
                </h2>
                <p className="text-xs text-slate-400">
                  Marca cada punto a medida que lo prepares
                </p>
              </div>

              {/* Filtro por categoría */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                {(
                  [
                    { id: "ALL", label: "Todos" },
                    { id: "ENTORNO", label: "Entorno" },
                    { id: "MENTAL", label: "Mental" },
                    { id: "SOFTWARE", label: "Software" },
                    { id: "TECNICO", label: "Técnico" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategoryFilter(tab.id)}
                    className={`px-2.5 py-1 rounded transition-all ${
                      activeCategoryFilter === tab.id
                        ? "bg-slate-800 text-white font-medium"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de ítems */}
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    item.completed
                      ? "bg-emerald-950/20 border-emerald-800/40 text-slate-300"
                      : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 text-slate-400 group-hover:text-emerald-400 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-relaxed ${
                        item.completed
                          ? "line-through text-slate-400"
                          : "text-slate-200"
                      }`}
                    >
                      {item.label}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      {item.category === "ENTORNO" && "🏠 Entorno y Físico"}
                      {item.category === "MENTAL" && "🧠 Mental Game"}
                      {item.category === "SOFTWARE" && "💻 Software & HUD"}
                      {item.category === "TECNICO" && "🎯 Estrategia y Spots"}
                    </span>
                  </div>

                  {item.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomItem(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                      title="Eliminar ítem personalizado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Input para agregar ítem personalizado */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                value={newCustomText}
                onChange={(e) => setNewCustomText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCustomItem();
                }}
                placeholder="+ Agregar ítem o regla personalizada a tu rutina..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={addCustomItem}
                disabled={!newCustomText.trim()}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-white flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {/* Recordatorios Rápidos de Spots Críticos (Cheat Sheet) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Recordatorios Clave de Spots (Quick Cheat Sheet)</span>
              </div>
              {onOpenLeaks && (
                <button
                  onClick={onOpenLeaks}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <span>Ver Leaks & Spots</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Pozos Rolleados (Iso-Raise)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Size estándar: <strong>4bb + 1bb por limper</strong> (fuera de
                  posición subir 1bb extra). Atacar con fuerza rangos débiles
                  recreacionales.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Pozos 3-Bet IP</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Sizing 3x-3.5x en posición. Postflop mantén la agresión en
                  boards secos y coordina barrels cuando tengas ventaja de rango.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Pozos 3-Bet OOP (Ciegas)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Sizing grande (4x-4.5x) para compensar la desventaja
                  posicional. Como caller OOP, cuidado con sobre-defender botes
                  grandes sin valor real.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Defensa BB vs BTN</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Defiende amplio preflop con odds favorables, pero foldea
                  disciplinadamente en river ante líneas de agresión continua si
                  no bloqueas los faroles del villano.
                </p>
              </div>
            </div>
          </div>

          {/* Notas de la Sesión / Diario Rápido */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Notas Rápidas para esta Sesión
            </span>
            <textarea
              rows={2}
              value={data.notes}
              onChange={(e) => saveData({ notes: e.target.value })}
              placeholder="Anota algo relevante de tus rivales habituales o sensaciones antes de abrir mesas..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-all resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
