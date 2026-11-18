"use client";

import React, { useState, useEffect } from "react";
import {
  BookmarkPlus,
  Trash2,
  Copy,
  Check,
  Search,
  Tag,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export interface MarkedHand {
  id: string;
  handNumber: string;
  spot: string;
  resultBb: number;
  tag: "DUDA_RIVER" | "REVISION_COACH" | "BOTES_3BET" | "ROLLEO" | "BAD_BEAT" | "OTRO";
  notes: string;
  date: string;
}

const STORAGE_KEY = "ist-coach-marked-hands-v1";

const TAG_CONFIG = {
  DUDA_RIVER: { label: "Duda River", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  REVISION_COACH: { label: "Revisar con Coach", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
  BOTES_3BET: { label: "Bote 3-Bet", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" },
  ROLLEO: { label: "Pozo Rolleado", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  BAD_BEAT: { label: "Bad Beat / Cool", color: "text-slate-400 bg-slate-800 border-slate-700" },
  OTRO: { label: "General", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
};

const INITIAL_DEMO_HANDS: MarkedHand[] = [
  {
    id: "hand-1",
    handNumber: "#249104812",
    spot: "BTN vs BB · 3-Bet Pot OOP",
    resultBb: -45,
    tag: "DUDA_RIVER",
    notes: "River completa color en T83-6-2. Villano shovea 75bb. Pagar con Overpair QQ sin blocker de color?",
    date: "Hoy 14:10",
  },
  {
    id: "hand-2",
    handNumber: "#249105120",
    spot: "CO Iso-Raise vs 2 Limpers",
    resultBb: +38.5,
    tag: "ROLLEO",
    notes: "Rolleo KQs a 5bb. Flop K94r c-bet 1/3, turn 8 barreleo 2/3. Pagaron los dos.",
    date: "Hoy 13:45",
  },
  {
    id: "hand-3",
    handNumber: "#249099814",
    spot: "BB vs BTN · Defensa SRP",
    resultBb: -12,
    tag: "REVISION_COACH",
    notes: "Check-call flop con JTs en board Q74ss. Floté turn con proyecto y me bluffeó river.",
    date: "Ayer 20:30",
  },
];

export default function MarkedHands() {
  const [hands, setHands] = useState<MarkedHand[]>(INITIAL_DEMO_HANDS);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Formulario nueva mano
  const [handNumber, setHandNumber] = useState("");
  const [spot, setSpot] = useState("");
  const [resultBb, setResultBb] = useState<number | "">("");
  const [tag, setTag] = useState<MarkedHand["tag"]>("DUDA_RIVER");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setHands(parsed);
      }
    } catch {
      // Ignorar error
    }
  }, []);

  function saveHands(newHands: MarkedHand[]) {
    setHands(newHands);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHands));
    } catch {
      // Ignorar error
    }
  }

  function handleAddHand(e: React.FormEvent) {
    e.preventDefault();
    if (!spot.trim()) return;

    const newHand: MarkedHand = {
      id: `hand-${Date.now()}`,
      handNumber: handNumber.trim() || `#PT4-${Math.floor(Math.random() * 900000 + 100000)}`,
      spot: spot.trim(),
      resultBb: typeof resultBb === "number" ? resultBb : 0,
      tag,
      notes: notes.trim(),
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    saveHands([newHand, ...hands]);
    setHandNumber("");
    setSpot("");
    setResultBb("");
    setNotes("");
  }

  function handleDelete(id: string) {
    saveHands(hands.filter((h) => h.id !== id));
  }

  function copyToClipboard(hand: MarkedHand) {
    const text = `[Mano PT4 ${hand.handNumber}] Spot: ${hand.spot} | Resultado: ${hand.resultBb > 0 ? "+" : ""}${hand.resultBb}bb | Tag: ${TAG_CONFIG[hand.tag].label}\nNota: ${hand.notes}`;
    navigator.clipboard.writeText(text);
    setCopiedId(hand.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const filteredHands = hands.filter((h) => {
    const matchesTag = selectedTagFilter === "ALL" || h.tag === selectedTagFilter;
    const matchesSearch =
      h.spot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.handNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="w-full space-y-6">
      {/* Encabezado */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Manos Marcadas & Spot Review</h1>
        <p className="text-xs text-slate-400 mt-1">
          Anota al instante las manos dudosas o pozos clave durante tu sesión para revisarlas con tu coach o en PT4.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulario para marcar mano (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <BookmarkPlus className="w-4 h-4 text-rose-400" />
            <span>Marcar Nueva Mano</span>
          </div>

          <form onSubmit={handleAddHand} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Spot / Situación</label>
              <input
                type="text"
                required
                value={spot}
                onChange={(e) => setSpot(e.target.value)}
                placeholder="Ej. BTN vs BB 3-bet pot o CO Iso-Raise"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Nº Mano (PT4)</label>
                <input
                  type="text"
                  value={handNumber}
                  onChange={(e) => setHandNumber(e.target.value)}
                  placeholder="#12345678"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Resultado (BB)</label>
                <input
                  type="number"
                  step="0.5"
                  value={resultBb}
                  onChange={(e) => setResultBb(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="-25 o +40"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Etiqueta</label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value as MarkedHand["tag"])}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Duda / Comentarios</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Qué línea tomó el rival? ¿Cuál fue tu razonamiento al tomar la decisión?"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Guardar Mano</span>
            </button>
          </form>
        </div>

        {/* Lista de manos guardadas (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Barra de Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por spot, nota o mano..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setSelectedTagFilter("ALL")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                  selectedTagFilter === "ALL"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Todas ({hands.length})
              </button>
              {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTagFilter(key)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                    selectedTagFilter === key
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listado */}
          {filteredHands.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              No hay manos marcadas que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHands.map((hand) => {
                const tagStyle = TAG_CONFIG[hand.tag] || TAG_CONFIG.OTRO;
                return (
                  <div
                    key={hand.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{hand.spot}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${tagStyle.color}`}>
                          {tagStyle.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-mono text-xs font-bold ${
                            hand.resultBb > 0
                              ? "text-emerald-400"
                              : hand.resultBb < 0
                              ? "text-rose-400"
                              : "text-slate-400"
                          }`}
                        >
                          {hand.resultBb > 0 ? `+${hand.resultBb}` : hand.resultBb} BB
                        </span>
                        <span className="text-[10px] text-slate-500">{hand.date}</span>
                      </div>
                    </div>

                    {hand.notes && (
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                        {hand.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="font-mono">{hand.handNumber}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(hand)}
                          className="hover:text-slate-200 transition-colors flex items-center gap-1"
                          title="Copiar resumen para Discord/Coach"
                        >
                          {copiedId === hand.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => handleDelete(hand.id)}
                          className="hover:text-rose-400 transition-colors flex items-center gap-1"
                          title="Eliminar mano"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Borrar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
