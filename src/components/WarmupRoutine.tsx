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
} from "lucide-react";

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

const STORAGE_KEY = "ist-coach-warmup-items-v2";

export default function WarmupRoutine() {
  const [items, setItems] = useState<ChecklistItem[]>(DEFAULT_ITEMS);
  const [newItemText, setNewItemText] = useState("");

  // Edición inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Cronómetro de sesión
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Cargar de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignorar
    }
  }, []);

  // Guardar en localStorage
  function saveItems(newItems: ChecklistItem[]) {
    setItems(newItems);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // Ignorar
    }
  }

  // Cronómetro
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

  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

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
    if (editingId === id) {
      setEditingId(null);
    }
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

  function resetTimer() {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  }

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Barra Superior: Título y Cronómetro */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Warm-up Pre-sesión</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {completedCount} de {totalCount} completados
          </p>
        </div>

        {/* Cronómetro */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <Timer className="w-4 h-4 text-indigo-400" />
          <div className="font-mono text-lg font-bold text-white min-w-[75px]">
            {formatTime(timerSeconds)}
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isTimerRunning
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pausar
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Iniciar
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              title="Reiniciar cronómetro a 00:00"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Checklist
          </span>
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
              className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
              title="Restaurar lista por defecto"
            >
              <RotateCw className="w-3 h-3" /> Restaurar base
            </button>
          </div>
        </div>

        {/* Lista de Ítems */}
        <div className="space-y-2">
          {items.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className={`group flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  item.completed
                    ? "bg-slate-950/40 border-slate-800/50"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="shrink-0 text-slate-400 hover:text-emerald-400 transition-colors"
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
                          ? "line-through text-slate-500"
                          : "text-slate-200"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                )}

                {/* Acciones del ítem (Editar / Borrar) */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(item);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors rounded hover:bg-slate-900"
                      title="Editar texto"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded hover:bg-slate-900"
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

        {/* Input para agregar ítem */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem();
            }}
            placeholder="+ Escribe un nuevo ítem para tu checklist..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
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
  );
}
