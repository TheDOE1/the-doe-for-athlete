"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MuscleInfoPanel } from "@/components/3d/MuscleInfoPanel";
import { FASCIAL_CHAINS, getMuscleById } from "@/lib/data/muscles";
import { Network, RotateCcw } from "lucide-react";

// ─── Lazy-loaded 3D scene (no SSR) ───────────────────────────────────────────

const AnatomyScene = dynamic(
  () => import("@/components/3d/AnatomyScene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#030712]">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
          <p className="text-xs text-zinc-500">Chargement du modèle 3D…</p>
        </div>
      </div>
    ),
  }
);

// ─── View type ────────────────────────────────────────────────────────────────

type ViewType = "anterior" | "posterior" | "lateral_r" | "lateral_l";

const VIEW_LABELS: Record<ViewType, string> = {
  anterior: "Antérieur",
  posterior: "Postérieur",
  lateral_r: "Latéral D",
  lateral_l: "Latéral G",
};

const VIEW_MUSCLE_HINTS: Record<ViewType, string[]> = {
  anterior: ["quadriceps", "rectus_abdominis", "obliques", "psoas", "adductors"],
  posterior: ["hamstrings", "glute_max", "calves"],
  lateral_r: ["tfl", "glute_med", "obliques"],
  lateral_l: ["tfl", "glute_med", "obliques"],
};

// ─── AnatomyPage ──────────────────────────────────────────────────────────────

export default function AnatomyPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<ViewType>("anterior");
  const [showFascialChains, setShowFascialChains] = useState(false);

  const selectedMuscle = selectedId ? getMuscleById(selectedId) : null;
  const visibleMuscles = VIEW_MUSCLE_HINTS[view];

  return (
    <div className="-mx-6 -my-6 flex h-screen flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 py-3 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-white">
            Anatomie &amp; Physiologie 3D
          </h1>
          <p className="text-xs text-zinc-500">
            Modèle anatomique interactif — chaînes myofasciales (Myers)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset selection */}
          {selectedId && (
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              Effacer sélection
            </button>
          )}

          {/* Fascial chains toggle */}
          <button
            onClick={() => setShowFascialChains((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              showFascialChains
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white"
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            Chaînes fasciales
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── 3D Canvas (70%) ── */}
        <div className="relative flex-1 bg-[#030712]">
          <AnatomyScene
            selectedId={selectedId}
            onSelect={setSelectedId}
            showFascialChains={showFascialChains}
            view={view}
            className="h-full w-full"
          />

          {/* View switcher (overlay on canvas) */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-xl border border-white/10 bg-black/60 p-1.5 backdrop-blur-md">
            {(Object.keys(VIEW_LABELS) as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  view === v
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>

          {/* Muscle hints overlay */}
          <div className="absolute left-3 top-3 space-y-1">
            <p className="text-xs text-zinc-600">Muscles visibles :</p>
            <div className="flex flex-wrap gap-1">
              {visibleMuscles.map((id) => {
                const m = getMuscleById(id);
                if (!m) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedId(id === selectedId ? null : id)}
                    className={`rounded-md border px-2 py-0.5 text-xs transition-all ${
                      selectedId === id
                        ? "border-orange-500/60 bg-orange-500/15 text-orange-300"
                        : "border-zinc-700/60 bg-black/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fascial chains legend (when active) */}
          {showFascialChains && (
            <div className="absolute right-3 top-3 space-y-1.5 rounded-xl border border-white/10 bg-black/70 p-3 backdrop-blur-md">
              <p className="text-xs font-semibold text-zinc-300">Anatomy Trains</p>
              {FASCIAL_CHAINS.map((chain) => (
                <div key={chain.id} className="flex items-center gap-2">
                  <span
                    className="h-2 w-5 rounded-full"
                    style={{ backgroundColor: chain.color, opacity: 0.8 }}
                  />
                  <span className="text-xs text-zinc-400">{chain.id}</span>
                  <span className="text-xs text-zinc-600">— {chain.name.split(" ").slice(0, 2).join(" ")}</span>
                </div>
              ))}
            </div>
          )}

          {/* Interaction hint */}
          {!selectedId && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-pulse">
              <p className="rounded-full border border-blue-500/30 bg-black/50 px-3 py-1 text-xs text-blue-400 backdrop-blur-sm">
                Cliquez sur un muscle pour explorer
              </p>
            </div>
          )}
        </div>

        {/* ── Info Panel (30%) ── */}
        <div className="w-80 flex-shrink-0 overflow-hidden border-l border-zinc-800 bg-zinc-950/50 xl:w-96">
          <div className="h-full p-3">
            <MuscleInfoPanel
              muscleId={selectedId}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </div>
      </div>

      {/* Selected muscle quick info bar */}
      {selectedMuscle && (
        <div className="flex flex-shrink-0 items-center gap-4 border-t border-zinc-800 bg-zinc-950 px-6 py-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: selectedMuscle.groupColor }}
          />
          <span className="text-sm font-medium text-white">
            {selectedMuscle.name}
          </span>
          <span className="text-xs text-zinc-500">
            {selectedMuscle.myofascialLine}
          </span>
          <div className="flex gap-2">
            <span className="rounded-full bg-cyan-900/30 px-2 py-0.5 text-xs text-cyan-400">
              {selectedMuscle.fiberTypeI}% Type I
            </span>
            <span className="rounded-full bg-orange-900/30 px-2 py-0.5 text-xs text-orange-400">
              {selectedMuscle.fiberTypeII}% Type II
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
