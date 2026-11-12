"use client";

import React, { useEffect } from "react";
import { PreflopScenario } from "@/data/pokerRanges";
import { POSITIONS } from "@/data/spots";

interface QuickSpotBarProps {
  spots: PreflopScenario[];
  activeId: string;
  importedIds: Set<string>;
  onSelect: (id: string) => void;
}

const HOTKEYS = ["q", "w", "e", "r", "t", "y", "u", "i"];

function label(s: PreflopScenario): string {
  if (s.category === "RFI") return "Open";
  if (s.category === "VS_OPEN") return `vs ${s.villainPos} open`;
  return `vs ${s.villainPos} 3bet`;
}

export default function QuickSpotBar({ spots, activeId, importedIds, onSelect }: QuickSpotBarProps) {
  const active = spots.find((s) => s.id === activeId) || spots[0];
  const heroSpots = spots.filter((s) => s.heroPos === active.heroPos);

  // Atajos: 1-6 = posición del héroe, q w e r t y = situación
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      const posIdx = ["1", "2", "3", "4", "5", "6"].indexOf(k);
      if (posIdx >= 0) {
        const pos = POSITIONS[posIdx];
        const list = spots.filter((s) => s.heroPos === pos);
        const keep = list.find((s) => s.category === active.category && s.villainPos === active.villainPos);
        const next = keep || list[0];
        if (next) onSelect(next.id);
        return;
      }
      const sitIdx = HOTKEYS.indexOf(k);
      if (sitIdx >= 0 && heroSpots[sitIdx]) onSelect(heroSpots[sitIdx].id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spots, active, heroSpots, onSelect]);

  let lastCategory = "";

  return (
    <div className="space-y-2">
      {/* Fila 1: tu posición */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-slate-500 w-14 shrink-0">Tú</span>
        {POSITIONS.map((pos, i) => {
          const list = spots.filter((s) => s.heroPos === pos);
          const isActive = active.heroPos === pos;
          const target =
            list.find((s) => s.category === active.category && s.villainPos === active.villainPos) || list[0];
          return (
            <button
              key={pos}
              disabled={!target}
              onClick={() => target && onSelect(target.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? "bg-slate-200 text-slate-900"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {pos}
              <span className="ml-1 text-[9px] opacity-50">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Fila 2: situación */}
      <div className="flex items-start gap-1.5">
        <span className="text-[11px] text-slate-500 w-14 shrink-0 pt-1.5">Spot</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {heroSpots.map((s, i) => {
            const separator = lastCategory && lastCategory !== s.category;
            lastCategory = s.category;
            return (
              <React.Fragment key={s.id}>
                {separator && <span className="w-px h-4 bg-slate-800 mx-1" />}
                <button
                  onClick={() => onSelect(s.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    s.id === active.id
                      ? "bg-slate-200 text-slate-900"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {label(s)}
                  {importedIds.has(s.id) && <span className="ml-1 text-emerald-500">•</span>}
                  <span className="ml-1 text-[9px] opacity-50">{HOTKEYS[i]}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
