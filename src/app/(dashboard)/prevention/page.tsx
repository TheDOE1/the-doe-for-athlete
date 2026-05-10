"use client";

import { useState } from "react";
import { WellnessForm } from "@/components/prevention/wellness-form";
import { WellnessChart } from "@/components/prevention/wellness-chart";
import { ACWRChart } from "@/components/prevention/acwr-chart";
import { TeamACWRList } from "@/components/prevention/team-acwr-list";
import { ProtocolTrident } from "@/components/prevention/protocol-trident";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Activity, Heart, TrendingUp, AlertTriangle, Plus, X, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

// ─── Injury types ─────────────────────────────────────────────────────────────

const INJURY_LOCATIONS = [
  "Ischio-jambiers", "Quadriceps", "Genou (LCA)", "Genou (latéral)",
  "Cheville", "Pied / orteil", "Adducteur / aine", "Mollet",
  "Tendon d'Achille", "Dos / lombaires", "Hanche", "Épaule", "Autre",
];
const INJURY_TYPES_LIST = [
  "Élongation", "Déchirure grade 1", "Déchirure grade 2", "Déchirure grade 3",
  "Entorse", "Contusion", "Fracture", "Tendinopathie", "Autre",
];
const SEV_COLORS = {
  minor: "bg-green-900/40 border-green-700/40 text-green-300",
  moderate: "bg-amber-900/40 border-amber-700/40 text-amber-300",
  severe: "bg-red-900/40 border-red-700/40 text-red-300",
};

// ─── Page Component ──────────────────────────────────────────────────────────

export default function PreventionPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>("1");
  const [wellnessSubmitted, setWellnessSubmitted] = useState(false);
  const [injuryModal, setInjuryModal] = useState(false);
  const [injuryForm, setInjuryForm] = useState({
    playerId: "",
    type: "",
    location: "",
    mechanism: "",
    severity: "moderate" as "minor" | "moderate" | "severe",
    startDate: new Date().toISOString().split("T")[0]!,
    returnDate: "",
  });

  // Real data
  const { data: teams } = trpc.team.list.useQuery();
  const teamId = teams?.[0]?.id;
  const { data: realPlayers = [] } = trpc.player.list.useQuery(
    { teamId: teamId! }, { enabled: !!teamId }
  );
  const { data: teamInjuries = [], refetch: refetchInjuries } =
    trpc.prevention.listInjuriesByTeam.useQuery(
      { teamId: teamId! }, { enabled: !!teamId }
    );

  const playerMap = Object.fromEntries(
    realPlayers.map((p) => [p.id, `${p.firstName} ${p.lastName}`])
  );

  const createInjury = trpc.prevention.createInjury.useMutation({
    onSuccess: () => {
      void refetchInjuries();
      setInjuryModal(false);
      setInjuryForm({
        playerId: "", type: "", location: "", mechanism: "",
        severity: "moderate",
        startDate: new Date().toISOString().split("T")[0]!,
        returnDate: "",
      });
    },
  });

  const demoWellness = generateDemoWellness();
  const demoACWR = generateDemoACWR();
  const demoTeamACWR = generateDemoTeamACWR();

  const createWellness = trpc.wellness.create.useMutation({
    onSuccess: () => {
      setWellnessSubmitted(true);
      setTimeout(() => setWellnessSubmitted(false), 3000);
    },
  });

  const handleWellnessSubmit = (data: {
    sleep: number;
    fatigue: number;
    soreness: number;
    stress: number;
    mood: number;
    notes: string;
  }) => {
    const pid = realPlayers[0]?.id;
    if (!pid) return;
    createWellness.mutate({
      playerId: pid,
      date: new Date().toISOString().split("T")[0]!,
      sleep: data.sleep,
      fatigue: data.fatigue,
      soreness: data.soreness,
      stress: data.stress,
      mood: data.mood,
    });
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

      {/* ── Injury Tracker ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Blessures de l&apos;équipe
            {teamInjuries.length > 0 && (
              <span className="rounded-full bg-red-900/40 border border-red-700/40 px-2 py-0.5 text-xs text-red-300">
                {teamInjuries.length}
              </span>
            )}
          </h2>
          <Button
            onClick={() => setInjuryModal(true)}
            disabled={!teamId}
            size="sm"
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Signaler
          </Button>
        </div>

        {teamInjuries.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-600">
            Aucune blessure enregistrée — cliquez sur &quot;Signaler&quot; pour ajouter.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {teamInjuries.map((inj) => (
              <div
                key={inj.id}
                className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    SEV_COLORS[inj.severity]
                  )}>
                    {inj.severity === "minor" ? "Légère" : inj.severity === "moderate" ? "Modérée" : "Sévère"}
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {new Date(inj.startDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">
                  {playerMap[inj.playerId] ?? "Joueur"}
                </p>
                <p className="text-xs text-zinc-400">{inj.location} · {inj.type}</p>
                {inj.returnDate && (
                  <p className="text-[10px] text-zinc-600">
                    Retour : {new Date(inj.returnDate).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Injury Modal */}
      {injuryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInjuryModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Signaler une blessure</h2>
              <button onClick={() => setInjuryModal(false)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!injuryForm.playerId || !injuryForm.type || !injuryForm.location) return;
                createInjury.mutate({
                  ...injuryForm,
                  mechanism: injuryForm.mechanism || undefined,
                  returnDate: injuryForm.returnDate || undefined,
                });
              }}
              className="space-y-4"
            >
              {/* Player */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Joueur *</label>
                <select
                  required value={injuryForm.playerId}
                  onChange={(e) => setInjuryForm((f) => ({ ...f, playerId: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="">— Sélectionner —</option>
                  {realPlayers.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>
              {/* Type + Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Type *</label>
                  <select required value={injuryForm.type}
                    onChange={(e) => setInjuryForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="">—</option>
                    {INJURY_TYPES_LIST.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Zone *</label>
                  <select required value={injuryForm.location}
                    onChange={(e) => setInjuryForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="">—</option>
                    {INJURY_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              {/* Severity */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Sévérité</label>
                <div className="flex gap-2">
                  {(["minor", "moderate", "severe"] as const).map((s) => (
                    <button key={s} type="button"
                      onClick={() => setInjuryForm((f) => ({ ...f, severity: s }))}
                      className={cn(
                        "flex-1 rounded-xl border py-2 text-xs font-medium transition-colors",
                        injuryForm.severity === s ? SEV_COLORS[s] : "border-zinc-700 text-zinc-500"
                      )}
                    >
                      {s === "minor" ? "Légère" : s === "moderate" ? "Modérée" : "Sévère"}
                    </button>
                  ))}
                </div>
              </div>
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Date survenue</label>
                  <input type="date" value={injuryForm.startDate}
                    onChange={(e) => setInjuryForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Retour prévu</label>
                  <input type="date" value={injuryForm.returnDate}
                    onChange={(e) => setInjuryForm((f) => ({ ...f, returnDate: e.target.value }))}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
              {/* Mechanism */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Mécanisme / notes</label>
                <textarea rows={2} value={injuryForm.mechanism}
                  onChange={(e) => setInjuryForm((f) => ({ ...f, mechanism: e.target.value }))}
                  placeholder="Comment s'est produite la blessure..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>
              {createInjury.error && (
                <p className="text-sm text-red-400">{createInjury.error.message}</p>
              )}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setInjuryModal(false)}
                  className="flex-1 border border-zinc-700 text-zinc-400">
                  Annuler
                </Button>
                <Button type="submit"
                  disabled={createInjury.isPending || !injuryForm.playerId || !injuryForm.type || !injuryForm.location}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white">
                  {createInjury.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Signaler"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
