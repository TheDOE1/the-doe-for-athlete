"use client";

import { useState } from "react";
import { WellnessForm } from "@/components/prevention/wellness-form";
import { WellnessChart } from "@/components/prevention/wellness-chart";
import { ACWRChart } from "@/components/prevention/acwr-chart";
import { TeamACWRList } from "@/components/prevention/team-acwr-list";
import { ProtocolTrident } from "@/components/prevention/protocol-trident";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Activity, Heart, TrendingUp } from "lucide-react";

// ─── Demo Data ───────────────────────────────────────────────────────────────
// Used until real API data is connected

function generateDemoWellness() {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split("T")[0]!,
      sleep: Math.floor(Math.random() * 4) + 5,
      fatigue: Math.floor(Math.random() * 5) + 3,
      soreness: Math.floor(Math.random() * 4) + 2,
      stress: Math.floor(Math.random() * 4) + 3,
      mood: Math.floor(Math.random() * 4) + 5,
    });
  }
  return data;
}

function generateDemoACWR() {
  const data = [];
  const today = new Date();
  let ratio = 1.0;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    ratio += (Math.random() - 0.48) * 0.15;
    ratio = Math.max(0.5, Math.min(2.2, ratio));
    const zone: "green" | "orange" | "red" =
      ratio > 1.5 ? "red" : ratio > 1.3 ? "orange" : "green";
    data.push({
      date: d.toISOString().split("T")[0]!,
      ratio: Math.round(ratio * 100) / 100,
      acuteLoad: Math.round(ratio * 450),
      chronicLoad: 450,
      zone,
    });
  }
  return data;
}

const DEMO_PLAYERS = [
  { id: "1", firstName: "Kylian", lastName: "Mbappé", position: "ATT" },
  { id: "2", firstName: "Antoine", lastName: "Griezmann", position: "MIL" },
  { id: "3", firstName: "Aurélien", lastName: "Tchouaméni", position: "MIL" },
  { id: "4", firstName: "Jules", lastName: "Koundé", position: "DEF" },
  { id: "5", firstName: "Mike", lastName: "Maignan", position: "GK" },
  { id: "6", firstName: "Ousmane", lastName: "Dembélé", position: "ATT" },
];

function generateDemoTeamACWR() {
  return DEMO_PLAYERS.map((player) => {
    const ratio = 0.6 + Math.random() * 1.2;
    const zone: "green" | "orange" | "red" =
      ratio > 1.5 ? "red" : ratio > 1.3 ? "orange" : "green";
    return {
      player,
      acwr: {
        ratio: Math.round(ratio * 100) / 100,
        zone,
        acuteLoad: Math.round(ratio * 420),
        chronicLoad: 420,
        date: new Date().toISOString().split("T")[0]!,
      },
    };
  });
}

const DEMO_PROTOCOLS = [
  {
    id: "p1",
    type: "nordic" as const,
    complianceRate: 87,
    frequency: 3,
    exercises: [
      { name: "Nordic Curl", sets: 3, reps: 6 },
      { name: "Razor Curl", sets: 3, reps: 8 },
    ],
    startDate: "2024-09-01",
  },
  {
    id: "p2",
    type: "copenhagen" as const,
    complianceRate: 62,
    frequency: 2,
    exercises: [
      { name: "Copenhagen Plank", sets: 3, reps: 10 },
      { name: "Side-Lying Adduction", sets: 3, reps: 12 },
    ],
    startDate: "2024-09-15",
  },
  {
    id: "p3",
    type: "reverse_nordic" as const,
    complianceRate: 45,
    frequency: 2,
    exercises: [
      { name: "Reverse Nordic Curl", sets: 3, reps: 8 },
      { name: "Spanish Squat", sets: 3, reps: 10 },
    ],
    startDate: "2024-10-01",
  },
];

// ─── Page Component ──────────────────────────────────────────────────────────

export default function PreventionPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>("1");
  const [wellnessSubmitted, setWellnessSubmitted] = useState(false);

  const demoWellness = generateDemoWellness();
  const demoACWR = generateDemoACWR();
  const demoTeamACWR = generateDemoTeamACWR();

  const handleWellnessSubmit = (data: {
    sleep: number;
    fatigue: number;
    soreness: number;
    stress: number;
    mood: number;
    notes: string;
  }) => {
    // TODO: Connect to tRPC mutation
    console.log("Wellness submitted:", data);
    setWellnessSubmitted(true);
    setTimeout(() => setWellnessSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Bouclier de Prévention
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Monitoring wellness, ACWR temps réel & protocoles de prévention
          </p>
        </div>
        <Badge variant="info" className="gap-1">
          <Shield className="h-3 w-3" />
          Phase 1 Active
        </Badge>
      </div>

      {/* Success Toast */}
      {wellnessSubmitted && (
        <div className="animate-in slide-in-from-top rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
          <p className="text-sm font-medium text-emerald-400">
            Données wellness enregistrées avec succès
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card glass className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">ACWR Moyen</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">
                {(demoTeamACWR.reduce((s, p) => s + (p.acwr?.ratio ?? 0), 0) / demoTeamACWR.length).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
        <Card glass className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Alertes</p>
              <p className="text-xl font-bold text-red-500">
                {demoTeamACWR.filter((p) => p.acwr?.zone === "red").length}
              </p>
            </div>
          </div>
        </Card>
        <Card glass className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Heart className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Wellness Moy.</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">
                {demoWellness.length > 0
                  ? (
                      demoWellness.reduce(
                        (s, w) => s + (w.sleep + w.mood) / 2 - (w.fatigue + w.soreness + w.stress) / 3,
                        0
                      ) / demoWellness.length + 5
                    ).toFixed(1)
                  : "—"}/10
              </p>
            </div>
          </div>
        </Card>
        <Card glass className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Shield className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Compliance Moy.</p>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">
                {Math.round(
                  DEMO_PROTOCOLS.reduce((s, p) => s + (p.complianceRate ?? 0), 0) /
                    DEMO_PROTOCOLS.length
                )}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: Team ACWR + Alerts */}
        <div className="xl:col-span-1 space-y-6">
          <TeamACWRList
            players={demoTeamACWR}
            onSelectPlayer={(id) => setSelectedPlayer(id)}
          />
        </div>

        {/* Center/Right: Charts + Form */}
        <div className="xl:col-span-2 space-y-6">
          {/* ACWR Chart */}
          <ACWRChart
            data={demoACWR}
            playerName={
              selectedPlayer
                ? DEMO_PLAYERS.find((p) => p.id === selectedPlayer)?.lastName
                : undefined
            }
          />

          {/* Wellness Chart */}
          <WellnessChart data={demoWellness} />

          {/* Protocols Trident */}
          <ProtocolTrident protocols={DEMO_PROTOCOLS} />

          {/* Wellness Form */}
          <WellnessForm onSubmit={handleWellnessSubmit} />
        </div>
      </div>
    </div>
  );
}
