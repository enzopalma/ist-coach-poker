"use client";

import React, { useEffect, useState } from "react";
import { PreflopScenario } from "@/data/pokerRanges";
import { RangeOverride, parseRange, rangeToText } from "@/data/spots";

interface RangeImportModalProps {
  isOpen: boolean;
  spot: PreflopScenario;
  isImported: boolean;
  onClose: () => void;
  onSave: (ov: RangeOverride) => void;
  onReset: () => void;
}

export default function RangeImportModal({
  isOpen,
  spot,
  isImported,
  onClose,
  onSave,
  onReset,
}: RangeImportModalProps) {
  const [raise, setRaise] = useState("");
  const [call, setCall] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRaise(rangeToText(spot.frequencies, "raise"));
      setCall(rangeToText(spot.frequencies, "call"));
    }
  }, [isOpen, spot]);

  if (!isOpen) return null;

  const r = parseRange(raise);
  const c = parseRange(call);
  const errors = [...r.errors, ...c.errors];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-slate-500 hover:text-white">
          ✕
        </button>
        <h3 className="text-base font-semibold text-white">Importar rango · {spot.title}</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Pega las manos separadas por coma. Formatos: <code>AA</code>, <code>77+</code>, <code>ATs+</code>,{" "}
          <code>A2s-A5s</code>, <code>KQo</code>, y frecuencia con <code>AKo:50</code> (porcentaje) o{" "}
          <code>AKo:0.5</code>.
        </p>

        <label className="text-xs text-slate-400 block mb-1">
          {spot.category === "RFI" ? "Open raise" : spot.category === "VS_OPEN" ? "3-Bet" : "4-Bet"} (rojo) ·{" "}
          {Object.keys(r.map).length} manos
        </label>
        <textarea
          value={raise}
          onChange={(e) => setRaise(e.target.value)}
          rows={3}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-slate-600"
        />

        {spot.category !== "RFI" && (
          <>
            <label className="text-xs text-slate-400 block mb-1">
              Call (verde) · {Object.keys(c.map).length} manos
            </label>
            <textarea
              value={call}
              onChange={(e) => setCall(e.target.value)}
              rows={3}
              className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-slate-600"
            />
          </>
        )}

        {errors.length > 0 && (
          <p className="text-xs text-amber-400 mb-3">No se reconoció: {errors.join(", ")}</p>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            disabled={!isImported}
            className="text-xs text-slate-400 hover:text-white disabled:opacity-30"
          >
            Restaurar referencia
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs text-slate-300 bg-slate-800 hover:bg-slate-700">
              Cancelar
            </button>
            <button
              onClick={() => {
                onSave({ raise, call: spot.category === "RFI" ? "" : call });
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-200 text-slate-900 hover:bg-white"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
