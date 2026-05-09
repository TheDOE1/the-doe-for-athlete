"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeartPulse, Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

// ─── Slider component ─────────────────────────────────────────────────────────

const METRICS = [
  { key: "sleep",    label: "Qualité du sommeil", low: "Très mauvais", high: "Excellent",    color: "blue"    },
  { key: "fatigue",  label: "Fatigue",             low: "Aucune",       high: "Extrême",      color: "orange"  },
  { key: "soreness", label: "Courbatures",         low: "Aucune",       high: "Très sévères", color: "red"     },
  { key: "mood",     label: "Humeur",              low: "Très mauvaise",high: "Excellente",   color: "green"   },
  { key: "stress",   label: "Stress",              low: "Aucun",        high: "Très élevé",   color: "purple"  },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

const colorClasses: Record<string, string> = {
  blue:   "accent-blue-500",
  orange: "accent-orange-500",
  red:    "accent-red-500",
  green:  "accent-green-500",
  purple: "accent-purple-500",
};

function MetricSlider({
  label, low, high, value, color, onChange,
}: {
  label: string; low: string; high: string;
  value: number; color: string; onChange: (v: number) => void;
}) {
  const pct = ((value - 1) / 4) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-sm font-bold text-white w-8 text-center">
          {value}
        </span>
      </div>
      <input
        type="range" min={1} max={5} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("w-full h-2 rounded-lg cursor-pointer bg-zinc-700", colorClasses[color])}
      />
      <div className="flex justify-between text-[10px] text-zinc-600">
        <span>{low}</span><span>{high}</span>
      </div>
    </div>
  );
}

// ─── Wellness history row ─────────────────────────────────────────────────────

function HistoryRow({ entry }: { entry: Record<string, unknown> }) {
  const date = new Date(entry.date as string);
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
      <div className="w-20 shrink-0">
        <p className="text-xs font-semibold text-zinc-300">
          {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
        </p>
        <p className="text-[10px] text-zinc-600">
          {date.toLocaleDateString("fr-FR", { weekday: "short" })}
        </p>
      </div>
      <div className="flex flex-1 gap-3">
        {METRICS.map((m) => {
          const val = entry[m.key] as number | null;
          return (
            <div key={m.key} className="flex flex-col items-center gap-0.5">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                val === null ? "bg-zinc-800 text-zinc-600" :
                val <= 2 ? "bg-green-900/40 text-green-300" :
                val === 3 ? "bg-amber-900/40 text-amber-300" :
                "bg-red-900/40 text-red-300"
              )}>
                {val ?? "—"}
              </div>
              <span className="text-[9px] text-zinc-700 text-center leading-tight w-12 truncate">
                {m.label.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>
      {entry.hrv && (
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-blue-300">{entry.hrv as number}</p>
          <p className="text-[10px] text-zinc-600">HRV</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WellnessPage() {
  const today = new Date().toISOString().split("T")[0]!;
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<MetricKey, number>>({
    sleep: 3, fatigue: 3, soreness: 3, mood: 3, stress: 3,
  });
  const [hrv, setHrv] = useState("");
  const [date, setDate] = useState(today);
  const [saved, setSaved] = useState(false);

  // Data
  const { data: teams } = trpc.team.list.useQuery();
  const teamId = teams?.[0]?.id;
  const { data: players = [] } = trpc.player.list.useQuery(
    { teamId: teamId! }, { enabled: !!teamId }
  );
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  const { data: history = [] } = trpc.wellness.listByPlayer.useQuery(
    { playerId: selectedPlayerId!, limit: 14 },
    { enabled: !!selectedPlayerId }
  );

  const utils = trpc.useUtils();
  const create = trpc.wellness.create.useMutation({
    onSuccess: () => {
      void utils.wellness.listByPlayer.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;
    create.mutate({
      playerId: selectedPlayerId,
      date,
      ...values,
      hrv: hrv ? Number(hrv) : undefined,
    });
  };

  // Player nav
  const currentIdx = players.findIndex((p) => p.id === selectedPlayerId);
  const prevPlayer = currentIdx > 0 ? players[currentIdx - 1] : null;
  const nextPlayer = currentIdx < players.length - 1 ? players[currentIdx + 1] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-900/30">
          <HeartPulse className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Wellness Quotidien</h1>
          <p className="text-sm text-zinc-500">Saisie des paramètres de récupération</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left: Form ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Saisie</h2>

          {/* Player selector */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Joueur</label>
            <select
              value={selectedPlayerId ?? ""}
              onChange={(e) => { setSelectedPlayerId(e.target.value || null); setSaved(false); }}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">— Sélectionner un joueur —</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} {p.position ? `(${p.position})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Date</label>
            <input
              type="date" value={date} max={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Sliders */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {METRICS.map((m) => (
              <MetricSlider
                key={m.key}
                label={m.label} low={m.low} high={m.high} color={m.color}
                value={values[m.key]}
                onChange={(v) => setValues((prev) => ({ ...prev, [m.key]: v }))}
              />
            ))}

            {/* HRV */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                HRV (ms) <span className="text-zinc-600">— optionnel</span>
              </label>
              <input
                type="number" min={20} max={150} value={hrv}
                onChange={(e) => setHrv(e.target.value)}
                placeholder="Ex : 68"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {create.error && (
              <p className="text-sm text-red-400">{create.error.message}</p>
            )}

            <Button
              type="submit"
              disabled={!selectedPlayerId || create.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              {create.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : saved ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : null}
              {saved ? "Enregistré !" : "Enregistrer"}
            </Button>
          </form>
        </div>

        {/* ── Right: History ── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              Historique — 14 derniers jours
            </h2>
            {selectedPlayer && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => prevPlayer && setSelectedPlayerId(prevPlayer.id)}
                  disabled={!prevPlayer}
                  className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-800 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium text-zinc-400 w-28 text-center truncate">
                  {selectedPlayer.firstName} {selectedPlayer.lastName}
                </span>
                <button
                  onClick={() => nextPlayer && setSelectedPlayerId(nextPlayer.id)}
                  disabled={!nextPlayer}
                  className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-800 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {!selectedPlayerId ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <HeartPulse className="h-10 w-10 text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-600">Sélectionnez un joueur pour voir son historique wellness</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-zinc-600">Aucune donnée enregistrée pour ce joueur</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <HistoryRow key={entry.id} entry={entry as Record<string, unknown>} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
