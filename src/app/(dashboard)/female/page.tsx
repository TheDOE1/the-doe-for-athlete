"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularCycle } from "@/components/female/circular-cycle";
import { BiomechanicsSection } from "@/components/female/biomechanics-section";
import { REDSDashboard } from "@/components/female/reds-dashboard";
import { EncyclopediaSection } from "@/components/female/encyclopedia-section";
import {
  CYCLE_PHASES,
  getCyclePhase,
  getPhaseData,
  calculateREDSRisk,
} from "@/lib/data/female-physiology";
import {
  Heart,
  ShieldAlert,
  Dna,
  BookOpen,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Activity,
  Droplets,
  Zap,
} from "lucide-react";

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_PLAYERS = [
  { id: "1", firstName: "Amandine", lastName: "Henry",    position: "MIL", dayOfCycle: 8  },
  { id: "2", firstName: "Marie-Antoinette", lastName: "Katoto", position: "ATT", dayOfCycle: 14 },
  { id: "3", firstName: "Griedge", lastName: "Mbock",     position: "DEF", dayOfCycle: 20 },
  { id: "4", firstName: "Wendie", lastName: "Renard",     position: "DEF", dayOfCycle: 3  },
  { id: "5", firstName: "Selma",  lastName: "Bacha",      position: "MIL", dayOfCycle: 17 },
  { id: "6", firstName: "Maëlle", lastName: "Lakrar",     position: "DEF", dayOfCycle: 11 },
];

const DEMO_REDS = [
  { id: "1", name: "M. Katoto",  risk: "high"     as const, blockHighImpact: true,  amenorrheaMonths: 4  },
  { id: "2", name: "G. Mbock",   risk: "moderate" as const, blockHighImpact: false, amenorrheaMonths: 1  },
  { id: "3", name: "W. Renard",  risk: "low"      as const, blockHighImpact: false, amenorrheaMonths: 0  },
  { id: "4", name: "A. Henry",   risk: "low"      as const, blockHighImpact: false, amenorrheaMonths: 0  },
];

// ─── Phase Badge Helper ───────────────────────────────────────────────────────

const PHASE_BADGE_STYLES = {
  follicular: "bg-emerald-900/40 text-emerald-300 border-emerald-700/40",
  ovulatory:  "bg-red-900/60 text-red-200 border-red-700/40 animate-pulse",
  luteal:     "bg-amber-900/40 text-amber-300 border-amber-700/40",
  menstrual:  "bg-zinc-800 text-zinc-400 border-zinc-600/40",
};

const PHASE_DOT_COLORS = {
  follicular: "bg-emerald-500",
  ovulatory:  "bg-red-500",
  luteal:     "bg-amber-500",
  menstrual:  "bg-zinc-500",
};

// ─── Cycle Quick-Entry Form ───────────────────────────────────────────────────

interface CycleQuickEntryProps {
  onSubmit: (playerId: string, dayOfCycle: number, symptoms: Record<string, boolean>) => void;
}

function CycleQuickEntry({ onSubmit }: CycleQuickEntryProps) {
  const [selectedPlayer, setSelectedPlayer] = useState(DEMO_PLAYERS[0]!.id);
  const [dayOfCycle, setDayOfCycle] = useState(1);
  const [symptoms, setSymptoms] = useState({
    cramping: false,
    bloating: false,
    headache: false,
    moodSwings: false,
    fatigue: false,
  });

  const toggleSymptom = (key: keyof typeof symptoms) =>
    setSymptoms((s) => ({ ...s, [key]: !s[key] }));

  const phase = getCyclePhase(dayOfCycle);
  const phaseData = getPhaseData(phase);

  return (
    <Card glass className="border-pink-900/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Heart className="h-4 w-4 text-pink-400" />
          Saisie rapide — Jour du cycle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player select */}
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Joueuse</label>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
          >
            {DEMO_PLAYERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Day of cycle slider */}
        <div>
          <div className="mb-1 flex justify-between">
            <label className="text-xs font-medium text-zinc-400">Jour du cycle</label>
            <span className="text-sm font-bold text-pink-300">J{dayOfCycle}</span>
          </div>
          <input
            type="range"
            min={1}
            max={35}
            value={dayOfCycle}
            onChange={(e) => setDayOfCycle(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-[11px] text-zinc-600">
            <span>J1 (règles)</span>
            <span>J14 (ovulation)</span>
            <span>J28+</span>
          </div>
        </div>

        {/* Live phase indicator */}
        <div className={cn(
          "rounded-lg border p-3 transition-all",
          phase === "ovulatory" ? "border-red-700/50 bg-red-950/20" :
          phase === "follicular" ? "border-emerald-700/30 bg-emerald-950/10" :
          phase === "luteal" ? "border-amber-700/30 bg-amber-950/10" :
          "border-zinc-700/50 bg-zinc-800/30"
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white">{phaseData.name}</span>
            {phase === "ovulatory" && (
              <span className="flex items-center gap-1 text-[10px] text-red-300">
                <AlertTriangle className="h-3 w-3" /> ALERTE LCA
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400">{phaseData.trainingRecommendations.intensityLabel}</p>
        </div>

        {/* Symptoms */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-400">Symptômes</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(symptoms) as (keyof typeof symptoms)[]).map((key) => {
              const labels: Record<string, string> = {
                cramping: "Crampes", bloating: "Ballonnements", headache: "Céphalées",
                moodSwings: "Humeur", fatigue: "Fatigue",
              };
              return (
                <button
                  key={key}
                  onClick={() => toggleSymptom(key)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] transition-all",
                    symptoms[key]
                      ? "border-pink-600 bg-pink-900/40 text-pink-200"
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                  )}
                >
                  {labels[key]}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={() => onSubmit(selectedPlayer, dayOfCycle, symptoms)}
          className="w-full bg-pink-700 hover:bg-pink-600 text-white"
          size="md"
        >
          Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Team Cycle Grid ──────────────────────────────────────────────────────────

function TeamCycleGrid({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Card glass className="border-zinc-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-pink-400" />
          Vue d'ensemble équipe — Phases actuelles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {DEMO_PLAYERS.map((player) => {
            const phase = getCyclePhase(player.dayOfCycle);
            const isOvulatory = phase === "ovulatory";
            return (
              <button
                key={player.id}
                onClick={() => onSelect(player.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all",
                  selectedId === player.id
                    ? "border-pink-600 bg-pink-900/20"
                    : "border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("h-2.5 w-2.5 rounded-full", PHASE_DOT_COLORS[phase])} />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="text-xs text-zinc-500">{player.position} · J{player.dayOfCycle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOvulatory && (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  )}
                  <span className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    PHASE_BADGE_STYLES[phase]
                  )}>
                    {getPhaseData(phase).name.split(" ").slice(1).join(" ")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const phaseCounts = DEMO_PLAYERS.reduce(
    (acc, p) => {
      const phase = getCyclePhase(p.dayOfCycle);
      acc[phase] = (acc[phase] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const stats = [
    {
      icon: Heart,
      label: "Joueuses suivies",
      value: DEMO_PLAYERS.length,
      color: "text-pink-400 bg-pink-500/10",
    },
    {
      icon: AlertTriangle,
      label: "Alertes LCA (ovulation)",
      value: phaseCounts.ovulatory ?? 0,
      color: "text-red-400 bg-red-500/10",
    },
    {
      icon: Zap,
      label: "Phase optimale (folliculaire)",
      value: phaseCounts.follicular ?? 0,
      color: "text-emerald-400 bg-emerald-500/10",
    },
    {
      icon: ShieldAlert,
      label: "Risque RED-S",
      value: DEMO_REDS.filter((p) => p.risk !== "low").length,
      color: "text-amber-400 bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} glass className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-lg p-2", stat.color.split(" ")[1])}>
              <stat.icon className={cn("h-4 w-4", stat.color.split(" ")[0])} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{stat.label}</p>
              <p className="text-xl font-black text-white">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Tab Navigation ───────────────────────────────────────────────────────────

type ActiveTab = "cycle" | "biomechanics" | "reds" | "encyclopedia";

type TabIcon = React.ComponentType<{ className?: string }>;
const TABS: { id: ActiveTab; label: string; icon: TabIcon; color: string }[] = [
  { id: "cycle",        label: "Suivi Cycle",     icon: Heart,      color: "bg-pink-700 text-white" },
  { id: "biomechanics", label: "Biomécanique",    icon: Dna,        color: "bg-purple-700 text-white" },
  { id: "reds",         label: "Dépistage RED-S", icon: ShieldAlert, color: "bg-red-700 text-white" },
  { id: "encyclopedia", label: "Encyclopédie",    icon: BookOpen,   color: "bg-indigo-700 text-white" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FemalePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("cycle");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(DEMO_PLAYERS[0]!.id);

  const selectedPlayer = useMemo(
    () => DEMO_PLAYERS.find((p) => p.id === selectedPlayerId) ?? DEMO_PLAYERS[0]!,
    [selectedPlayerId]
  );

  const handleCycleSubmit = (
    playerId: string,
    dayOfCycle: number,
    symptoms: Record<string, boolean>
  ) => {
    // TODO: Connect to tRPC mutation female.saveCycleEntry
    console.log("Cycle entry:", { playerId, dayOfCycle, symptoms });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <span className="text-3xl">♀</span>
            Élite Féminine
          </h1>
          <p className="mt-1 text-zinc-400">
            Cycle menstruel · Prévention LCA · Dépistage RED-S · Encyclopédie bio-mécanique
          </p>
        </div>
        <Badge className="bg-pink-900/40 text-pink-300 border border-pink-700/40 gap-1 text-sm px-3 py-1">
          <Heart className="h-3.5 w-3.5" />
          Phase 5
        </Badge>
      </div>

      {/* ── Stats ── */}
      <StatsBar />

      {/* ── Tab bar ── */}
      <div className="flex flex-wrap gap-2 rounded-xl bg-zinc-800/50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all sm:text-sm",
              activeTab === tab.id
                ? tab.color + " shadow-sm"
                : "text-zinc-400 hover:text-white"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}

      {/* Cycle Tab */}
      {activeTab === "cycle" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left: Team overview */}
          <div className="xl:col-span-1 space-y-6">
            <TeamCycleGrid
              selectedId={selectedPlayerId}
              onSelect={setSelectedPlayerId}
            />
            <CycleQuickEntry onSubmit={handleCycleSubmit} />
          </div>

          {/* Right: Circular calendar + recommendations */}
          <div className="xl:col-span-2 space-y-6">
            {/* Circular Calendar */}
            <Card glass className="border-pink-900/20 p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-medium text-zinc-400">
                    {selectedPlayer.firstName} {selectedPlayer.lastName}
                  </p>
                  <CircularCycle
                    currentDay={selectedPlayer.dayOfCycle}
                    playerName={`${selectedPlayer.firstName} ${selectedPlayer.lastName}`}
                    size={240}
                  />
                </div>

                {/* Phase details */}
                <div className="flex-1 space-y-4">
                  {(() => {
                    const phase = getCyclePhase(selectedPlayer.dayOfCycle);
                    const data = getPhaseData(phase);
                    return (
                      <>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn("h-3 w-3 rounded-full", PHASE_DOT_COLORS[phase])} />
                            <h3 className="text-lg font-bold text-white">{data.name}</h3>
                            <span className="text-zinc-500 text-sm">{data.days}</span>
                          </div>
                          {phase === "ovulatory" && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-700/50 bg-red-950/20 p-2.5 mt-2">
                              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                              <p className="text-xs text-red-200 font-medium">
                                ALERTE : Hyperlaxité ligamentaire — Risque LCA ×3. Remplacer COD par proprioception.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Hormones */}
                        <div>
                          <p className="text-xs font-medium text-zinc-500 mb-1.5">Profil hormonal :</p>
                          <div className="flex flex-wrap gap-1">
                            {data.hormones.map((h, i) => (
                              <span key={i} className="rounded-full bg-pink-950/30 border border-pink-800/30 px-2 py-0.5 text-[11px] text-pink-300">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Training recs */}
                        <div>
                          <p className="text-xs font-medium text-zinc-500 mb-1.5">Recommandations entraînement :</p>
                          <div className={cn(
                            "rounded-lg border p-3",
                            data.trainingRecommendations.greenLight
                              ? "border-emerald-800/30 bg-emerald-950/10"
                              : "border-red-800/30 bg-red-950/10"
                          )}>
                            <p className={cn(
                              "text-xs font-semibold mb-2",
                              data.trainingRecommendations.greenLight ? "text-emerald-300" : "text-red-300"
                            )}>
                              {data.trainingRecommendations.greenLight ? "✓" : "⚠"} {data.trainingRecommendations.intensityLabel}
                            </p>
                            <ul className="space-y-1">
                              {data.trainingRecommendations.sessionTypes.map((s, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                                  <ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-zinc-600" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Hydration */}
                        <div className="flex items-center gap-2 rounded-lg bg-blue-950/20 border border-blue-800/20 px-3 py-2">
                          <Droplets className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span className="text-xs text-zinc-300">{data.hydration}</span>
                        </div>

                        {/* Science note */}
                        <div className="rounded-lg bg-zinc-800/40 p-3">
                          <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                            {data.scienceNote}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </Card>

            {/* All phases mini-overview */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CYCLE_PHASES.map((phase) => (
                <Card
                  key={phase.id}
                  glass
                  className={cn(
                    "p-3 cursor-pointer border transition-all",
                    getCyclePhase(selectedPlayer.dayOfCycle) === phase.id
                      ? "border-pink-600 bg-pink-900/10"
                      : "border-zinc-700/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("h-2 w-2 rounded-full", PHASE_DOT_COLORS[phase.id])} />
                    <p className="text-xs font-semibold text-white truncate">{phase.name}</p>
                  </div>
                  <p className="text-[10px] text-zinc-500">{phase.days}</p>
                  <p className="mt-1 text-[10px] text-zinc-400 leading-tight line-clamp-2">
                    {phase.physiologicalEffects[0]}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Biomechanics Tab */}
      {activeTab === "biomechanics" && <BiomechanicsSection />}

      {/* RED-S Tab */}
      {activeTab === "reds" && <REDSDashboard demoPlayers={DEMO_REDS} />}

      {/* Encyclopedia Tab */}
      {activeTab === "encyclopedia" && <EncyclopediaSection />}
    </div>
  );
}
