"use client";

import { useState } from "react";
import { getMuscleById, MUSCLES } from "@/lib/data/muscles";
import {
  X,
  ChevronRight,
  Dumbbell,
  Zap,
  AlertTriangle,
  Shield,
  Network,
  Activity,
} from "lucide-react";

// ─── Fiber Ratio Bar ──────────────────────────────────────────────────────────

function FiberRatioBar({
  typeI,
  typeII,
}: {
  typeI: number;
  typeII: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>Type I (endurance)</span>
        <span>Type II (puissance)</span>
      </div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-500 text-xs font-bold text-white transition-all duration-500"
          style={{ width: `${typeI}%` }}
        >
          {typeI}%
        </div>
        <div
          className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold text-white transition-all duration-500"
          style={{ width: `${typeII}%` }}
        >
          {typeII}%
        </div>
      </div>
    </div>
  );
}

// ─── Tab system ───────────────────────────────────────────────────────────────

type TabId = "anatomy" | "physio" | "football" | "injuries" | "prevention";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "anatomy", label: "Anatomie", icon: <Activity className="h-3 w-3" /> },
  { id: "physio", label: "Physio", icon: <Zap className="h-3 w-3" /> },
  { id: "football", label: "Football", icon: <ChevronRight className="h-3 w-3" /> },
  { id: "injuries", label: "Blessures", icon: <AlertTriangle className="h-3 w-3" /> },
  {
    id: "prevention",
    label: "Prévention",
    icon: <Shield className="h-3 w-3" />,
  },
];

// ─── Chain Badge ──────────────────────────────────────────────────────────────

const CHAIN_COLORS: Record<string, string> = {
  SBL: "border-orange-500/50 bg-orange-500/10 text-orange-300",
  SFL: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300",
  LL: "border-purple-500/50 bg-purple-500/10 text-purple-300",
  SPL: "border-amber-500/50 bg-amber-500/10 text-amber-300",
  DFL: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  AL: "border-pink-500/50 bg-pink-500/10 text-pink-300",
};

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10">
        <Network className="h-8 w-8 text-blue-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-300">
          Sélectionnez un muscle
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Cliquez sur un groupe musculaire du modèle 3D pour afficher ses
          informations détaillées
        </p>
      </div>
      <div className="w-full space-y-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <p className="mb-2 text-xs font-medium text-zinc-400">
          Groupes musculaires disponibles :
        </p>
        <div className="flex flex-wrap gap-1">
          {MUSCLES.map((m) => (
            <span
              key={m.id}
              className="rounded-md border border-zinc-700 px-1.5 py-0.5 text-xs text-zinc-500"
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MuscleInfoPanel ──────────────────────────────────────────────────────────

interface MuscleInfoPanelProps {
  muscleId: string | null;
  onClose: () => void;
}

export function MuscleInfoPanel({ muscleId, onClose }: MuscleInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("anatomy");
  const muscle = muscleId ? getMuscleById(muscleId) : null;

  // Reset tab when muscle changes
  const displayMuscle = muscle;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-2xl backdrop-blur-md">
      {/* Gradient top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/8 px-4 py-4">
        {displayMuscle ? (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: displayMuscle.groupColor }}
              />
              <p className="truncate text-xs text-zinc-400">
                {displayMuscle.group}
              </p>
            </div>
            <h2 className="mt-0.5 text-lg font-bold text-white">
              {displayMuscle.name}
            </h2>
            <p className="text-xs text-zinc-500 italic">
              {displayMuscle.nameEn}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-base font-semibold text-zinc-300">
              Anatomie Musculaire
            </h2>
            <p className="text-xs text-zinc-500">Modèle 3D Interactif</p>
          </div>
        )}
        {displayMuscle && (
          <button
            onClick={onClose}
            className="ml-2 flex-shrink-0 rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {!displayMuscle ? (
        <EmptyState />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-0.5 overflow-x-auto border-b border-white/8 px-3 py-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* ── Anatomie ── */}
            {activeTab === "anatomy" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Chefs musculaires
                  </p>
                  <ul className="space-y-1">
                    {displayMuscle.subMuscles.map((sm) => (
                      <li key={sm} className="flex items-start gap-2 text-xs text-zinc-300">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />
                        {sm}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                    <p className="mb-1 text-xs font-semibold text-zinc-400">
                      Origine
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-300">
                      {displayMuscle.origin}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                    <p className="mb-1 text-xs font-semibold text-zinc-400">
                      Insertion
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-300">
                      {displayMuscle.insertion}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                    <p className="mb-0.5 text-xs font-semibold text-zinc-400">
                      Pennation
                    </p>
                    <p className="text-xs text-zinc-300">
                      {displayMuscle.pennationAngle}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
                    <p className="mb-0.5 text-xs font-semibold text-zinc-400">
                      Innervation
                    </p>
                    <p className="text-xs text-zinc-300">
                      {displayMuscle.innervation}
                    </p>
                  </div>
                </div>

                {/* Fascial chain badge */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                  <p className="mb-2 text-xs font-semibold text-zinc-400">
                    Chaîne myofasciale (Myers)
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      CHAIN_COLORS[displayMuscle.myofascialLineId] ??
                      "border-zinc-600 bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    <Network className="h-3 w-3" />
                    {displayMuscle.myofascialLine}
                  </span>
                  {displayMuscle.connectedMuscles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {displayMuscle.connectedMuscles.map((cm) => (
                        <span
                          key={cm}
                          className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
                        >
                          {cm}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Physiologie ── */}
            {activeTab === "physio" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Composition en fibres musculaires
                  </p>
                  <FiberRatioBar
                    typeI={displayMuscle.fiberTypeI}
                    typeII={displayMuscle.fiberTypeII}
                  />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-cyan-900/20 p-2.5 text-center">
                      <p className="text-lg font-bold text-cyan-400">
                        {displayMuscle.fiberTypeI}%
                      </p>
                      <p className="text-xs text-zinc-400">Type I</p>
                      <p className="text-xs text-zinc-500">Lentes / Oxydatives</p>
                    </div>
                    <div className="rounded-lg bg-orange-900/20 p-2.5 text-center">
                      <p className="text-lg font-bold text-orange-400">
                        {displayMuscle.fiberTypeII}%
                      </p>
                      <p className="text-xs text-zinc-400">Type II</p>
                      <p className="text-xs text-zinc-500">
                        Rapides / Glycolytiques
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                  <p className="mb-1 text-xs font-semibold text-zinc-400">
                    Implication biomécanique
                  </p>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    Avec{" "}
                    <span className="font-semibold text-orange-400">
                      {displayMuscle.fiberTypeII}% de fibres rapides (Type II)
                    </span>
                    , ce muscle est{" "}
                    {displayMuscle.fiberTypeII >= 50
                      ? "particulièrement sollicité lors des actions explosives (sprints, frappes, sauts)."
                      : "davantage orienté vers les efforts de stabilisation et d'endurance posturale."}
                  </p>
                </div>
              </div>
            )}

            {/* ── Football ── */}
            {activeTab === "football" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                  <p className="mb-1 text-xs font-semibold text-blue-300">
                    Rôle principal
                  </p>
                  <p className="text-sm font-medium leading-relaxed text-zinc-200">
                    {displayMuscle.footballRole}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Actions spécifiques
                  </p>
                  {displayMuscle.footballActions.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5"
                    >
                      <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded bg-blue-600/30">
                        <span className="text-xs font-bold text-blue-300">
                          {i + 1}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-300">
                        {action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Blessures ── */}
            {activeTab === "injuries" && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Blessures courantes
                </p>
                {displayMuscle.commonInjuries.map((injury, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-red-500/20 bg-red-500/5 p-3"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                      <div>
                        <p className="text-xs font-semibold text-red-300">
                          {injury.name}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                          <span className="font-medium text-zinc-300">
                            Mécanisme :{" "}
                          </span>
                          {injury.mechanism}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Prévention ── */}
            {activeTab === "prevention" && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Exercices de prévention recommandés
                </p>
                {displayMuscle.preventionExercises.map((ex, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600/20">
                      <Dumbbell className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-emerald-300">
                        {ex.name}
                      </p>
                      <p className="text-xs text-zinc-400">{ex.sets}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-2 rounded-lg border border-zinc-700 bg-zinc-900/40 p-2.5">
                  <p className="text-xs text-zinc-500">
                    Pour les protocoles complets et le suivi de la compliance,
                    rendez-vous dans le module{" "}
                    <span className="font-medium text-blue-400">
                      /prevention
                    </span>
                    .
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
