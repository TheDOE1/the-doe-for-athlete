"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, Loader2, X, Zap, Clock, Calendar } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionType = "field" | "gym" | "match" | "recovery";

const SESSION_TYPES: { value: SessionType; label: string; color: string; icon: string }[] = [
  { value: "field",    label: "Terrain",     color: "bg-green-900/40 border-green-700/40 text-green-300",   icon: "⚽" },
  { value: "gym",      label: "Salle",       color: "bg-blue-900/40 border-blue-700/40 text-blue-300",      icon: "💪" },
  { value: "match",    label: "Match",       color: "bg-red-900/40 border-red-700/40 text-red-300",         icon: "🏆" },
  { value: "recovery", label: "Récupération",color: "bg-purple-900/40 border-purple-700/40 text-purple-300",icon: "🔄" },
];

// ─── RPE Logger ───────────────────────────────────────────────────────────────

function RpeLogger({
  sessionId,
  players,
  onClose,
}: {
  sessionId: string;
  players: { id: string; firstName: string; lastName: string; position: string | null }[];
  onClose: () => void;
}) {
  const [loads, setLoads] = useState<Record<string, { rpe: number; duration: number }>>({});
  const utils = trpc.useUtils();
  const addLoad = trpc.session.addLoad.useMutation();

  const handleSave = async () => {
    const entries = Object.entries(loads).filter(([, v]) => v.rpe > 0);
    for (const [playerId, { rpe, duration }] of entries) {
      await addLoad.mutateAsync({ sessionId, playerId, rpe, durationMin: duration });
    }
    void utils.session.listByTeam.invalidate();
    onClose();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Entrez le RPE (1-10) et la durée (min) pour chaque joueur participant.
      </p>
      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg bg-zinc-800/50 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {p.firstName} {p.lastName}
              </p>
              {p.position && <p className="text-[10px] text-zinc-600">{p.position}</p>}
            </div>
            <input
              type="number" min={1} max={10} placeholder="RPE"
              value={loads[p.id]?.rpe ?? ""}
              onChange={(e) => setLoads((prev) => ({
                ...prev,
                [p.id]: { rpe: Number(e.target.value), duration: prev[p.id]?.duration ?? 60 },
              }))}
              className="w-16 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-center text-sm text-white focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number" min={1} max={120} placeholder="min"
              value={loads[p.id]?.duration ?? ""}
              onChange={(e) => setLoads((prev) => ({
                ...prev,
                [p.id]: { rpe: prev[p.id]?.rpe ?? 7, duration: Number(e.target.value) },
              }))}
              className="w-16 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-center text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        ))}
      </div>
      <Button
        onClick={() => void handleSave()}
        disabled={addLoad.isPending || Object.keys(loads).length === 0}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white"
      >
        {addLoad.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Enregistrer les charges
      </Button>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Session Row ──────────────────────────────────────────────────────────────

type Session = {
  id: string; teamId: string; type: SessionType;
  date: string; duration: number | null; rpeAvg: number | null;
};

function SessionRow({
  session, onLogRpe,
}: { session: Session; onLogRpe: (id: string) => void }) {
  const type = SESSION_TYPES.find((t) => t.value === session.type) ?? SESSION_TYPES[0]!;
  const d = new Date(session.date);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 hover:border-zinc-700 transition-colors">
      <div className="w-14 shrink-0 text-center">
        <p className="text-sm font-bold text-white">
          {d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
        </p>
        <p className="text-[10px] text-zinc-600 capitalize">
          {d.toLocaleDateString("fr-FR", { weekday: "short" })}
        </p>
      </div>
      <div className="text-2xl shrink-0">{type.icon}</div>
      <div className="flex-1">
        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", type.color)}>
          {type.label}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-zinc-500">
        {session.duration && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />{session.duration} min
          </span>
        )}
        {session.rpeAvg && (
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-amber-300 font-semibold">{session.rpeAvg}</span>
          </span>
        )}
      </div>
      <button
        onClick={() => onLogRpe(session.id)}
        className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-blue-600 hover:text-blue-300 transition-colors"
      >
        + RPE
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SessionsPage() {
  const today = new Date().toISOString().split("T")[0]!;
  const [modal, setModal] = useState<"create" | "rpe" | null>(null);
  const [rpeSessionId, setRpeSessionId] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "field" as SessionType,
    date: today,
    duration: 75,
    rpeAvg: undefined as number | undefined,
  });

  const { data: teams } = trpc.team.list.useQuery();
  const teamId = teams?.[0]?.id;

  const { data: sessions = [], isLoading } = trpc.session.listByTeam.useQuery(
    { teamId: teamId!, limit: 30 }, { enabled: !!teamId }
  );
  const { data: players = [] } = trpc.player.list.useQuery(
    { teamId: teamId! }, { enabled: !!teamId }
  );

  const utils = trpc.useUtils();
  const create = trpc.session.create.useMutation({
    onSuccess: () => { void utils.session.listByTeam.invalidate(); setModal(null); },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;
    create.mutate({ teamId, ...form, duration: Number(form.duration) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 shadow-lg shadow-amber-900/30">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Séances</h1>
            <p className="text-sm text-zinc-500">{sessions.length} séances enregistrées</p>
          </div>
        </div>
        <Button
          onClick={() => setModal("create")}
          disabled={!teamId}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white"
        >
          <Plus className="h-4 w-4" />
          Nouvelle séance
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SESSION_TYPES.map((t) => {
          const count = sessions.filter((s) => s.type === t.value).length;
          return (
            <div key={t.value} className={cn("rounded-xl border p-4", t.color)}>
              <p className="text-2xl mb-1">{t.icon}</p>
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs opacity-80">{t.label}</p>
            </div>
          );
        })}
      </div>

      {/* Sessions list */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-zinc-600" /></div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-20">
          <Calendar className="h-12 w-12 text-zinc-700 mb-3" />
          <p className="text-zinc-500">Aucune séance enregistrée</p>
          <p className="text-sm text-zinc-700 mt-1">Créez votre première séance</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <SessionRow
              key={s.id}
              session={s as Session}
              onLogRpe={(id) => { setRpeSessionId(id); setModal("rpe"); }}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {modal === "create" && (
        <Modal title="Nouvelle séance" onClose={() => setModal(null)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Type */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {SESSION_TYPES.map((t) => (
                  <button
                    key={t.value} type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all",
                      form.type === t.value ? t.color : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                    )}
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Date</label>
                <input
                  type="date" value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Durée (min)</label>
                <input
                  type="number" min={5} max={240} value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* RPE moyen */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                RPE moyen équipe <span className="text-zinc-600">— optionnel</span>
              </label>
              <input
                type="number" min={1} max={10} value={form.rpeAvg ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, rpeAvg: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="1-10"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {create.error && <p className="text-sm text-red-400">{create.error.message}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setModal(null)} className="flex-1 border border-zinc-700 text-zinc-400">
                Annuler
              </Button>
              <Button type="submit" disabled={create.isPending} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white">
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* RPE Logger modal */}
      {modal === "rpe" && rpeSessionId && (
        <Modal title="Saisir les RPE joueurs" onClose={() => { setModal(null); setRpeSessionId(null); }}>
          <RpeLogger
            sessionId={rpeSessionId}
            players={players}
            onClose={() => { setModal(null); setRpeSessionId(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
