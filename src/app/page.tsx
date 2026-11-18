"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DEMO_PT4_DATABASE, Pt4DatabaseSummary } from "@/data/pt4Analytics";
import {
  ALL_SPOTS,
  OVERRIDES_KEY,
  RangeOverride,
  applyOverride,
} from "@/data/spots";
import RangeMatrix13x13 from "@/components/RangeMatrix13x13";
import QuickSpotBar from "@/components/QuickSpotBar";
import RangeImportModal from "@/components/RangeImportModal";
import PostflopExplorer from "@/components/PostflopExplorer";
import Pt4AnalyticsDashboard from "@/components/Pt4AnalyticsDashboard";
import StudyRoomTrainer from "@/components/StudyRoomTrainer";
import WarmupRoutine from "@/components/WarmupRoutine";
import HandAnalysisLab from "@/components/HandAnalysisLab";
import SessionCooldown from "@/components/SessionCooldown";
import BankrollTracker from "@/components/BankrollTracker";
import ExploitGuide from "@/components/ExploitGuide";
import Pt4ConnectionModal from "@/components/Pt4ConnectionModal";
import {
  Timer,
  Coffee,
  FileSearch,
  BarChart3,
  Grid,
  Compass,
  Crosshair,
  Coins,
  Brain,
  Database,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

type MainTab =
  | "WARMUP"
  | "COOLDOWN"
  | "HAND_ANALYSIS"
  | "PT4_LEAKS"
  | "PREFLOP"
  | "POSTFLOP"
  | "EXPLOITS"
  | "BANKROLL"
  | "STUDY_ROOM";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<MainTab>("WARMUP");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("BTN_RFI");
  const [selectedPostflopSpotId, setSelectedPostflopSpotId] = useState<string>(
    "BTN_VS_BB_SRP_AK7R"
  );

  const [dbSummary, setDbSummary] = useState<Pt4DatabaseSummary>(DEMO_PT4_DATABASE);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Rangos importados por el usuario
  const [overrides, setOverrides] = useState<Record<string, RangeOverride>>({});
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(OVERRIDES_KEY);
      if (saved) setOverrides(JSON.parse(saved));
      const last = localStorage.getItem("ist-coach-last-spot");
      if (last && ALL_SPOTS.some((s) => s.id === last)) setSelectedScenarioId(last);
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ist-coach-last-spot", selectedScenarioId);
    } catch {
      /* ignorar */
    }
  }, [selectedScenarioId]);

  function saveOverrides(next: Record<string, RangeOverride>) {
    setOverrides(next);
    try {
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next));
    } catch {
      /* ignorar */
    }
  }

  const spots = useMemo(
    () => ALL_SPOTS.map((s) => (overrides[s.id] ? applyOverride(s, overrides[s.id]) : s)),
    [overrides]
  );

  const activeScenario = spots.find((s) => s.id === selectedScenarioId) || spots[0];

  function handleJumpToPreflopScenario(scenarioId: string) {
    const found = spots.find((s) => s.id === scenarioId);
    if (found) {
      setSelectedScenarioId(found.id);
      setActiveTab("PREFLOP");
    }
  }

  function handleJumpToPostflopSpot(spotId: string) {
    setSelectedPostflopSpotId(spotId);
    setActiveTab("POSTFLOP");
  }

  function selectTab(tab: MainTab) {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
        />
      )}

      {/* Sidebar Fija Izquierda */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-10 h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Encabezado Logo */}
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg width="34" height="34" viewBox="0 0 40 40" aria-label="IST Coach" className="shrink-0">
                <defs>
                  <mask id="istMoonMask">
                    <rect width="40" height="40" fill="white" />
                    <circle cx="27" cy="16" r="13" fill="black" />
                  </mask>
                </defs>
                <circle cx="20" cy="20" r="16" fill="#cbd5e1" mask="url(#istMoonMask)" />
                <g transform="translate(20.5 11) scale(0.62)">
                  <path
                    d="M12 2C12 2 4 9 4 14a4 4 0 0 0 7 2.5L10 22h4l-1-5.5a4 4 0 0 0 7-2.5C20 9 12 2 12 2z"
                    fill="#f43f5e"
                  />
                </g>
              </svg>
              <div>
                <span className="font-bold text-white text-sm tracking-tight block">IST COACH</span>
                <span className="text-[10px] text-slate-400 font-mono">Cash 6-Max 100bb</span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Menú de Navegación Vertical */}
          <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* Grupo 1: Sesión en Vivo */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sesión en Vivo
              </span>

              <button
                onClick={() => selectTab("WARMUP")}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                  activeTab === "WARMUP"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Timer className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sesión & Reloj</span>
              </button>

              <button
                onClick={() => selectTab("COOLDOWN")}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                  activeTab === "COOLDOWN"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Coffee className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Cool-down</span>
              </button>
            </div>

            {/* Grupo 2: Estudio & Datos */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Estudio & Datos
              </span>

              <button
                onClick={() => selectTab("HAND_ANALYSIS")}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                  activeTab === "HAND_ANALYSIS"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <FileSearch className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Laboratorio de Manos</span>
              </button>

              <button
                onClick={() => selectTab("PT4_LEAKS")}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                  activeTab === "PT4_LEAKS"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Leaks & Spots</span>
              </button>

              <button
                onClick={() => selectTab("PREFLOP")}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                  activeTab === "PREFLOP"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Grid className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Tablas Preflop</span>
              </button>

              <button
                onClick={() => selectTab("POSTFLOP")}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                  activeTab === "POSTFLOP"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Compass className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Estrategia Postflop</span>
              </button>

              <button
                onClick={() => selectTab("EXPLOITS")}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                  activeTab === "EXPLOITS"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Crosshair className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Guía de Exploits</span>
              </button>

              <button
                onClick={() => selectTab("BANKROLL")}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                  activeTab === "BANKROLL"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Gestión de Banca</span>
              </button>

              <button
                onClick={() => selectTab("STUDY_ROOM")}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                  activeTab === "STUDY_ROOM"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Brain className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Sala de Estudio</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Footer PT4 en el fondo de la barra lateral */}
        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <button
            onClick={() => setIsDbModalOpen(true)}
            className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors flex items-center justify-between group"
            title="Configurar conexión con PokerTracker 4"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  dbSummary.source === "POSTGRES_LIVE" ? "bg-emerald-400" : "bg-indigo-400"
                }`}
              />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-slate-200 block truncate">
                  {dbSummary.source === "POSTGRES_LIVE" ? dbSummary.playerName : "PT4 Demo"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {dbSummary.totalHands.toLocaleString()} manos
                </span>
              </div>
            </div>
            <Database className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
          </button>
        </div>
      </aside>

      {/* Área de Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Barra superior solo para Mobile */}
        <div className="md:hidden flex items-center justify-between p-3.5 bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">IST COACH</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Dinámico */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === "WARMUP" && (
            <WarmupRoutine
              dbSummary={dbSummary}
              onOpenDbModal={() => setIsDbModalOpen(true)}
            />
          )}

          {activeTab === "COOLDOWN" && <SessionCooldown />}

          {activeTab === "HAND_ANALYSIS" && <HandAnalysisLab />}

          {activeTab === "PT4_LEAKS" && (
            <Pt4AnalyticsDashboard
              dbSummary={dbSummary}
              onOpenPreflopScenario={handleJumpToPreflopScenario}
              onOpenPostflopSpot={handleJumpToPostflopSpot}
              onOpenStudyRoom={() => setActiveTab("STUDY_ROOM")}
              onOpenDbModal={() => setIsDbModalOpen(true)}
            />
          )}

          {activeTab === "PREFLOP" && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[11px] text-slate-500">Visor Preflop · Cash 6-Max 100bb</span>
                  <button
                    onClick={() => setIsImportOpen(true)}
                    className="text-[11px] text-slate-400 hover:text-white border border-slate-700 rounded px-2 py-1"
                  >
                    Importar rango
                  </button>
                </div>

                <QuickSpotBar
                  spots={spots}
                  activeId={activeScenario.id}
                  importedIds={new Set(Object.keys(overrides))}
                  onSelect={setSelectedScenarioId}
                />

                <div className="flex items-baseline gap-3 mt-4 pt-3 border-t border-slate-800">
                  <h1 className="text-lg font-semibold text-white">{activeScenario.title}</h1>
                  <span className="text-xs text-slate-500">{activeScenario.sizing}</span>
                  <span className="text-[11px] text-slate-600 ml-auto">
                    {overrides[activeScenario.id] ? "Rango importado" : "Referencia aproximada"}
                  </span>
                </div>
              </div>

              <RangeMatrix13x13 scenario={activeScenario} />

              <RangeImportModal
                isOpen={isImportOpen}
                spot={activeScenario}
                isImported={!!overrides[activeScenario.id]}
                onClose={() => setIsImportOpen(false)}
                onSave={(ov) => saveOverrides({ ...overrides, [activeScenario.id]: ov })}
                onReset={() => {
                  const next = { ...overrides };
                  delete next[activeScenario.id];
                  saveOverrides(next);
                }}
              />
            </div>
          )}

          {activeTab === "POSTFLOP" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-medium text-emerald-400 block">
                    Laboratorio Postflop · Texturas de Flop, Turn y River
                  </span>
                  <h1 className="text-lg font-semibold text-white mt-0.5">
                    Estrategia Postflop y Tamaños de Apuesta
                  </h1>
                </div>
                <button
                  onClick={() => setActiveTab("STUDY_ROOM")}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-2 self-start sm:self-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Practicar en Sala de Estudio</span>
                </button>
              </div>

              <PostflopExplorer initialSpotId={selectedPostflopSpotId} />
            </div>
          )}

          {activeTab === "EXPLOITS" && <ExploitGuide />}

          {activeTab === "BANKROLL" && <BankrollTracker />}

          {activeTab === "STUDY_ROOM" && <StudyRoomTrainer />}
        </main>
      </div>

      {/* PT4 Database Connection Modal */}
      <Pt4ConnectionModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        currentDb={dbSummary}
        onSelectDatabase={(newDb) => setDbSummary(newDb)}
      />
    </div>
  );
}
