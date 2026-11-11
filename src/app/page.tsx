"use client";

import React, { useState } from "react";
import {
  PREFLOP_SCENARIOS,
  ScenarioCategory,
  Position,
} from "@/data/pokerRanges";
import { DEMO_PT4_DATABASE, Pt4DatabaseSummary } from "@/data/pt4Analytics";
import RangeMatrix13x13 from "@/components/RangeMatrix13x13";
import PostflopExplorer from "@/components/PostflopExplorer";
import Pt4AnalyticsDashboard from "@/components/Pt4AnalyticsDashboard";
import StudyRoomTrainer from "@/components/StudyRoomTrainer";
import Pt4ConnectionModal from "@/components/Pt4ConnectionModal";
import {
  Grid,
  Compass,
  BarChart3,
  Brain,
  Database,
  Sparkles,
} from "lucide-react";

type MainTab = "PREFLOP" | "POSTFLOP" | "PT4_LEAKS" | "STUDY_ROOM";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<MainTab>("PREFLOP");
  const [selectedCategory, setSelectedCategory] =
    useState<ScenarioCategory>("RFI");
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<string>("UTG_RFI");
  const [selectedPostflopSpotId, setSelectedPostflopSpotId] = useState<string>(
    "BTN_VS_BB_SRP_AK7R"
  );

  const [dbSummary, setDbSummary] =
    useState<Pt4DatabaseSummary>(DEMO_PT4_DATABASE);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const activeScenario =
    PREFLOP_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
    PREFLOP_SCENARIOS[0];

  const categoryScenarios = PREFLOP_SCENARIOS.filter(
    (s) => s.category === selectedCategory
  );

  function handleJumpToPreflopScenario(scenarioId: string) {
    const found = PREFLOP_SCENARIOS.find((s) => s.id === scenarioId);
    if (found) {
      setSelectedCategory(found.category);
      setSelectedScenarioId(found.id);
      setActiveTab("PREFLOP");
    }
  }

  function handleJumpToPostflopSpot(spotId: string) {
    setSelectedPostflopSpotId(spotId);
    setActiveTab("POSTFLOP");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/90">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-3 pb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Logo: media luna de Estambul + pica de poker */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              aria-label="IST Coach"
              className="shrink-0"
            >
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
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold text-white">IST COACH</span>
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full text-slate-400 border border-slate-700">
                6-Max Cash 100bb
              </span>
            </div>
          </div>

          {/* Menú principal: debajo del encabezado */}
          <nav className="order-last w-full flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("PREFLOP")}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "PREFLOP"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Tablas Preflop</span>
            </button>

            <button
              onClick={() => setActiveTab("POSTFLOP")}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "POSTFLOP"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Estrategia Postflop</span>
            </button>

            <button
              onClick={() => setActiveTab("PT4_LEAKS")}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "PT4_LEAKS"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Leaks & Spots PT4</span>
            </button>

            <button
              onClick={() => setActiveTab("STUDY_ROOM")}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "STUDY_ROOM"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Sala de Estudio</span>
            </button>
          </nav>

          {/* Right: PT4 Database Connection Pill */}
          <button
            onClick={() => setIsDbModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium flex items-center gap-2 transition-all shrink-0"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dbSummary.source === "POSTGRES_LIVE"
                  ? "bg-emerald-400"
                  : "bg-indigo-400"
              }`}
            />
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline text-slate-200">
              {dbSummary.source === "POSTGRES_LIVE"
                ? `PT4 Live: ${dbSummary.playerName}`
                : `PT4 Demo (${dbSummary.totalHands.toLocaleString()} manos)`}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === "PREFLOP" && (
          <div className="space-y-6">
            {/* Preflop Situation Selector Bar (like Mento Poker / GTO Wizard) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-medium text-rose-400 block">
                    Visor Preflop · Cash 6-Max 100bb
                  </span>
                  <h1 className="text-lg font-semibold text-white mt-0.5">
                    {activeScenario.title}
                  </h1>
                </div>

                {/* Action Tree Category Selector */}
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { id: "RFI", label: "1. Open Raise (RFI)" },
                      { id: "VS_OPEN", label: "2. Vs Open (3-Bet / Call)" },
                      { id: "VS_3BET", label: "3. Vs 3-Bet (4-Bet / Call)" },
                    ] as { id: ScenarioCategory; label: string }[]
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        const firstInCat = PREFLOP_SCENARIOS.find(
                          (s) => s.category === cat.id
                        );
                        if (firstInCat) setSelectedScenarioId(firstInCat.id);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedCategory === cat.id
                          ? "bg-slate-700 text-white"
                          : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mesa 6-Max: selector único de posiciones */}
              <div className="flex items-center gap-1.5 pt-3">
                <span className="text-[11px] text-slate-500 mr-1">Mesa 6-Max:</span>
                {(["UTG", "MP", "CO", "BTN", "SB", "BB"] as Position[]).map(
                  (pos) => {
                    const target = categoryScenarios.find((s) => s.heroPos === pos);
                    const isHero = activeScenario.heroPos === pos;
                    const isVillain = activeScenario.villainPos === pos;
                    return (
                      <button
                        key={pos}
                        disabled={!target}
                        onClick={() => target && setSelectedScenarioId(target.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          isHero
                            ? "bg-slate-700 text-white"
                            : isVillain
                            ? "text-amber-300 border border-slate-700"
                            : target
                            ? "text-slate-400 hover:text-white"
                            : "text-slate-700 cursor-default"
                        }`}
                      >
                        {pos}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 13x13 Interactive Hand Matrix */}
            <RangeMatrix13x13 scenario={activeScenario} />
          </div>
        )}

        {activeTab === "POSTFLOP" && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-medium text-emerald-400 block">
                  Laboratorio Postflop · Flop, Turn y River por Textura
                </span>
                <h1 className="text-lg font-semibold text-white mt-0.5">
                  Estrategia Postflop, Tamaños de Apuesta y Categorías de Mano
                </h1>
              </div>
              <button
                onClick={() => setActiveTab("STUDY_ROOM")}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-2 self-start sm:self-center"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Practicar estos Boards en Sala de Estudio</span>
              </button>
            </div>

            <PostflopExplorer initialSpotId={selectedPostflopSpotId} />
          </div>
        )}

        {activeTab === "PT4_LEAKS" && (
          <Pt4AnalyticsDashboard
            dbSummary={dbSummary}
            onOpenPreflopScenario={handleJumpToPreflopScenario}
            onOpenPostflopSpot={handleJumpToPostflopSpot}
            onOpenStudyRoom={() => setActiveTab("STUDY_ROOM")}
            onOpenDbModal={() => setIsDbModalOpen(true)}
          />
        )}

        {activeTab === "STUDY_ROOM" && <StudyRoomTrainer />}
      </main>

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
