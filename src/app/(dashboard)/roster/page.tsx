"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  UserCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Sex = "male" | "female";
type Player = {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  sex: Sex | null;
  birthDate: Date | null;
  height: string | null;
  weight: string | null;
  teamId: string;
};

const POSITIONS = [
  "GK", "CB", "LB", "RB", "CDM", "CM", "CAM",
  "LM", "RM", "LW", "RW", "CF", "ST",
  "DEF", "MIL", "ATT",
];

// ─── Player Form ──────────────────────────────────────────────────────────────

function PlayerForm({
  initial,
  teamId,
  onSuccess,
  onCancel,
}: {
  initial?: Player;
  teamId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    position: initial?.position ?? "",
    sex: initial?.sex ?? ("male" as Sex),
    birthDate: initial?.birthDate
      ? new Date(initial.birthDate).toISOString().split("T")[0]!
      : "",
    height: initial?.height ?? "",
    weight: initial?.weight ?? "",
  });

  const create = trpc.player.create.useMutation({
    onSuccess: () => { void utils.player.list.invalidate(); onSuccess(); },
  });
  const update = trpc.player.update.useMutation({
    onSuccess: () => { void utils.player.list.invalidate(); onSuccess(); },
  });

  const isLoading = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initial) {
      update.mutate({ id: initial.id, ...form });
    } else {
      create.mutate({ ...form, teamId });
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    type = "text",
    placeholder = ""
  ) => (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {field("Prénom *", "firstName", "text", "Lucas")}
        {field("Nom *", "lastName", "text", "Dupont")}
      </div>

      {/* Position */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">
          Poste
        </label>
        <select
          value={form.position}
          onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="">— Choisir —</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Sex */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">
          Sexe
        </label>
        <div className="flex gap-3">
          {(["male", "female"] as Sex[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm((f) => ({ ...f, sex: s }))}
              className={cn(
                "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                form.sex === s
                  ? "border-blue-500 bg-blue-900/30 text-blue-300"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
              )}
            >
              {s === "male" ? "Masculin" : "Féminin"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {field("Date de naissance", "birthDate", "date")}
        {field("Taille (cm)", "height", "text", "178")}
        {field("Poids (kg)", "weight", "text", "74")}
      </div>

      {error && (
        <p className="text-sm text-red-400">Erreur : {error.message}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="flex-1 border border-zinc-700 text-zinc-400 hover:text-white"
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !form.firstName || !form.lastName}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : initial ? (
            "Modifier"
          ) : (
            "Ajouter"
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Player Card ──────────────────────────────────────────────────────────────

function PlayerCard({
  player,
  onEdit,
  onDelete,
}: {
  player: Player;
  onEdit: (p: Player) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 hover:border-zinc-700 transition-colors">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700">
        <UserCircle className="h-5 w-5 text-zinc-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">
          {player.firstName} {player.lastName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {player.position && (
            <span className="rounded-full bg-blue-900/40 border border-blue-700/40 px-2 py-0.5 text-[10px] font-medium text-blue-300">
              {player.position}
            </span>
          )}
          {player.sex && (
            <span className="text-[11px] text-zinc-600">
              {player.sex === "male" ? "H" : "F"}
            </span>
          )}
          {player.height && (
            <span className="text-[11px] text-zinc-600">{player.height} cm</span>
          )}
          {player.weight && (
            <span className="text-[11px] text-zinc-600">{player.weight} kg</span>
          )}
        </div>
      </div>
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(player)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-blue-400 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(player.id)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-red-900/30 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RosterPage() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Get teams
  const { data: teams, isLoading: teamsLoading } = trpc.team.list.useQuery();
  const teamId = teams?.[0]?.id;

  // Get players
  const { data: players = [], isLoading: playersLoading } =
    trpc.player.list.useQuery({ teamId: teamId! }, { enabled: !!teamId });

  const utils = trpc.useUtils();
  const deletePlayer = trpc.player.delete.useMutation({
    onSuccess: () => void utils.player.list.invalidate(),
  });

  const filtered = players.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      (p.position?.toLowerCase().includes(q) ?? false)
    );
  });

  const grouped = filtered.reduce<Record<string, Player[]>>((acc, p) => {
    const pos = p.position ?? "Autre";
    (acc[pos] ??= []).push(p);
    return acc;
  }, {});

  const isLoading = teamsLoading || playersLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/30">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Effectif</h1>
            <p className="text-sm text-zinc-500">
              {teams?.[0]?.name ?? "—"} · {players.length} joueur
              {players.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setModal("add")}
          disabled={!teamId}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white"
        >
          <Plus className="h-4 w-4" />
          Ajouter un joueur
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl border border-zinc-700/70 bg-zinc-900 px-4 py-2.5 focus-within:border-blue-600/60 transition-colors max-w-sm">
        <Search className="h-4 w-4 shrink-0 text-zinc-600" />
        <input
          type="text"
          placeholder="Rechercher un joueur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
        </div>
      ) : players.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-20">
          <Users className="h-12 w-12 text-zinc-700 mb-3" />
          <p className="text-zinc-500 font-medium">Aucun joueur dans l&apos;effectif</p>
          <p className="text-sm text-zinc-700 mt-1">Cliquez sur &quot;Ajouter un joueur&quot; pour commencer</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([pos, list]) => (
            <div key={pos}>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-xs font-semibold text-zinc-400">
                  {pos}
                </span>
                <span className="text-xs text-zinc-600">{list.length}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((p) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    onEdit={(pl) => { setEditingPlayer(pl); setModal("edit"); }}
                    onDelete={(id) => setConfirmDelete(id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {modal === "add" && teamId && (
        <Modal title="Ajouter un joueur" onClose={() => setModal(null)}>
          <PlayerForm
            teamId={teamId}
            onSuccess={() => setModal(null)}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {/* Edit modal */}
      {modal === "edit" && editingPlayer && teamId && (
        <Modal title="Modifier le joueur" onClose={() => setModal(null)}>
          <PlayerForm
            initial={editingPlayer}
            teamId={teamId}
            onSuccess={() => { setModal(null); setEditingPlayer(null); }}
            onCancel={() => { setModal(null); setEditingPlayer(null); }}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <Modal title="Supprimer le joueur ?" onClose={() => setConfirmDelete(null)}>
          <p className="mb-6 text-sm text-zinc-400">
            Cette action est irréversible. Le joueur et toutes ses données seront supprimés.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(null)}
              className="flex-1 border border-zinc-700 text-zinc-400"
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                deletePlayer.mutate({ id: confirmDelete });
                setConfirmDelete(null);
              }}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white"
              disabled={deletePlayer.isPending}
            >
              {deletePlayer.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Supprimer"
              )}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
