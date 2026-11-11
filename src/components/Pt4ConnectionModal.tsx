"use client";

import React, { useState } from "react";
import { DEMO_PT4_DATABASE, Pt4DatabaseSummary } from "@/data/pt4Analytics";
import { Position } from "@/data/pokerRanges";
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Cloud,
  Upload,
  FileSpreadsheet,
} from "lucide-react";

interface Pt4ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDb: Pt4DatabaseSummary;
  onSelectDatabase: (db: Pt4DatabaseSummary) => void;
}

type ConnectionTab = "CLOUD_UPLOAD" | "REMOTE_DB" | "DEMO";

export default function Pt4ConnectionModal({
  isOpen,
  onClose,
  currentDb,
  onSelectDatabase,
}: Pt4ConnectionModalProps) {
  const [tab, setTab] = useState<ConnectionTab>("CLOUD_UPLOAD");
  const [host, setHost] = useState("db.tu-servidor-cloud.supabase.co");
  const [port, setPort] = useState("5432");
  const [database, setDatabase] = useState("PT4_Cloud_DB");
  const [user, setUser] = useState("postgres");
  const [password, setPassword] = useState("");
  const [playerName, setPlayerName] = useState("Hero_Online");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [csvSuccessMsg, setCsvSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleCsvFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setCsvSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || "");
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length < 2) {
          setErrorMsg(
            "El archivo CSV está vacío o no tiene filas suficientes de PokerTracker 4."
          );
          return;
        }

        // Parse PT4 Position Report CSV (or flexible columns: Position, Hands, VPIP, PFR, RFI, 3Bet, Fold to 3Bet, Cold Call, CBet F, CBet T, WTSD, W$SD, WWSF, bb/100)
        const cloned: Pt4DatabaseSummary = JSON.parse(
          JSON.stringify(DEMO_PT4_DATABASE)
        );
        cloned.source = "CSV_IMPORT";
        cloned.databaseName = `Nube PT4 (${file.name})`;
        cloned.playerName = playerName || "Hero_PT4_Web";

        let parsedAnyPos = false;
        let totalHandsCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i]
            .split(/[,;]/)
            .map((c) => c.replace(/["'%$]/g, "").trim());
          if (cols.length < 4) continue;

          const posRaw = cols[0].toUpperCase();
          let posKey: Position | null = null;
          if (posRaw.includes("UTG") || posRaw.includes("LJ") || posRaw.includes("EP"))
            posKey = "UTG";
          else if (posRaw.includes("MP") || posRaw.includes("HJ")) posKey = "MP";
          else if (posRaw.includes("CO")) posKey = "CO";
          else if (posRaw.includes("BTN") || posRaw.includes("BU")) posKey = "BTN";
          else if (posRaw.includes("SB")) posKey = "SB";
          else if (posRaw.includes("BB")) posKey = "BB";

          if (posKey && cloned.positions[posKey]) {
            const hands = Number(cols[1]) || cloned.positions[posKey].hands;
            const vpip = Number(cols[2]) || cloned.positions[posKey].vpip;
            const pfr = Number(cols[3]) || cloned.positions[posKey].pfr;
            const threeBet = Number(cols[4]) || cloned.positions[posKey].threeBet;
            const bb100 = Number(cols[5]) || cloned.positions[posKey].bb100;

            cloned.positions[posKey] = {
              ...cloned.positions[posKey],
              hands,
              vpip,
              pfr,
              threeBet,
              bb100,
            };
            totalHandsCount += hands;
            parsedAnyPos = true;
          }
        }

        if (parsedAnyPos && totalHandsCount > 0) {
          cloned.totalHands = totalHandsCount;
        }

        setCsvSuccessMsg(
          `¡Archivo "${file.name}" sincronizado en la nube con éxito!`
        );
        onSelectDatabase(cloned);
      } catch {
        setErrorMsg("No se pudo procesar el archivo CSV exportado de PT4.");
      }
    };
    reader.readAsText(file);
  }

  async function handleConnectRemoteDb(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/pt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host,
          port: Number(port),
          database,
          user,
          password,
          playerName,
          action: "fetch_stats",
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErrorMsg(data.error || "No se pudo conectar al servidor remoto PT4");
      } else if (data.summary) {
        onSelectDatabase(data.summary);
        onClose();
      }
    } catch {
      setErrorMsg("Error al conectar con la base de datos remota en red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">
              Sincronización en Red con PokerTracker 4
            </h3>
            <p className="text-xs text-slate-400">
              Sube tus reportes de PT4 a la plataforma web o conecta tu servidor
              PostgreSQL en red
            </p>
          </div>
        </div>

        {/* Connection Method Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setTab("CLOUD_UPLOAD")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === "CLOUD_UPLOAD"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir CSV PT4 (Web)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("REMOTE_DB")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === "REMOTE_DB"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>DB en Red / Cloud</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("DEMO")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === "DEMO"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Datos Demo Online</span>
          </button>
        </div>

        {tab === "CLOUD_UPLOAD" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 text-center transition-all">
              <FileSpreadsheet className="w-9 h-9 text-indigo-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">
                Sube tu Reporte por Posición de PokerTracker 4 (.csv)
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                En PokerTracker 4 ve a{" "}
                <strong className="text-slate-200">
                  Statistics → Position → Clic derecho → Export to CSV
                </strong>{" "}
                y súbelo aquí para analizar tus spots desde cualquier navegador en red.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-indigo-600/30">
                <Upload className="w-4 h-4" />
                <span>Seleccionar Archivo CSV de PT4</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {csvSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{csvSuccessMsg}</span>
              </div>
            )}
          </div>
        )}

        {tab === "REMOTE_DB" && (
          <form onSubmit={handleConnectRemoteDb} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Host Remoto / Servidor Cloud PostgreSQL
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Puerto
                </label>
                <input
                  type="text"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Base de Datos
                </label>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando en red...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conectar Servidor PostgreSQL</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {tab === "DEMO" && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div className="text-xs">
              <span className="text-white font-bold block mb-1">
                Base de Datos Cloud Demo (62,450 manos NL50 6-Max)
              </span>
              <span className="text-slate-400">
                Incluye estadísticas reales por posición y leaks preflop/postflop listos
                para explorar.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectDatabase(DEMO_PT4_DATABASE);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0"
            >
              Cargar Demo Online
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
