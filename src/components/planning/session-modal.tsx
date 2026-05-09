"use client";

import { useState } from "react";
import { X, Calendar, Clock, Target, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SessionFormData {
  type: "field" | "gym" | "match" | "recovery";
  date: string;
  duration: number;
  objective: string;
  rpeAvg?: number;
  exercises: string;
}

interface SessionModalProps {
  initialDate?: string;
  onClose: () => void;
  onSubmit: (data: SessionFormData) => void;
  isSubmitting?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SESSION_TYPES = [
  {
    value: "field" as const,
    label: "Terrain",
    icon: "⚽",
    color: "border-emerald-500 bg-emerald-500/10 text-emerald-300",
  },
  {
    value: "gym" as const,
    label: "Salle",
    icon: "🏋️",
    color: "border-blue-500 bg-blue-500/10 text-blue-300",
  },
  {
    value: "match" as const,
    label: "Match",
    icon: "🏆",
    color: "border-red-500 bg-red-500/10 text-red-300",
  },
  {
    value: "recovery" as const,
    label: "Récupération",
    icon: "💤",
    color: "border-zinc-500 bg-zinc-500/10 text-zinc-300",
  },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function SessionModal({
  initialDate,
  onClose,
  onSubmit,
  isSubmitting,
}: SessionModalProps) {
  const [form, setForm] = useState<SessionFormData>({
    type: "field",
    date: initialDate ?? new Date().toISOString().split("T")[0]!,
    duration: 90,
    objective: "",
    rpeAvg: undefined,
    exercises: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700/60 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Nouvelle Session
              </h2>
              <p className="text-xs text-zinc-500">Planifier une séance d&apos;entraînement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Type de session
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SESSION_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition-all",
                    form.type === t.value
                      ? cn(t.color, "ring-2 ring-offset-1 ring-offset-zinc-900 ring-current")
                      : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  )}
                >
                  <span className="text-xl">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                <Calendar className="inline h-3.5 w-3.5 mr-1 opacity-60" />
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                <Clock className="inline h-3.5 w-3.5 mr-1 opacity-60" />
                Durée (min)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                }
                min={1}
                max={360}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Objective */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              <Target className="inline h-3.5 w-3.5 mr-1 opacity-60" />
              Objectif de la séance
            </label>
            <input
              type="text"
              value={form.objective}
              onChange={(e) =>
                setForm((f) => ({ ...f, objective: e.target.value }))
              }
              placeholder="ex: Endurance aérobie haute intensité..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* RPE prévu */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              RPE prévu (1–10)
              <span className="ml-1 text-xs text-zinc-500">— optionnel</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={form.rpeAvg ?? 6}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rpeAvg: Number(e.target.value) }))
                }
                className="flex-1 accent-blue-500"
              />
              <span className="w-10 rounded-lg bg-zinc-800 px-2 py-1 text-center text-sm font-bold text-white border border-zinc-700">
                {form.rpeAvg ?? "—"}
              </span>
            </div>
            {form.rpeAvg && (
              <p className="mt-1 text-xs text-zinc-500">
                sRPE estimé :{" "}
                <span className="font-semibold text-blue-400">
                  {form.rpeAvg * form.duration} UA
                </span>
              </p>
            )}
          </div>

          {/* Exercises */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              <Dumbbell className="inline h-3.5 w-3.5 mr-1 opacity-60" />
              Exercices prévus
              <span className="ml-1 text-xs text-zinc-500">— optionnel</span>
            </label>
            <textarea
              value={form.exercises}
              onChange={(e) =>
                setForm((f) => ({ ...f, exercises: e.target.value }))
              }
              rows={3}
              placeholder="ex: Échauffement 15min, Jeu positionnel 4v4, Finitions..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Création..." : "Créer la session"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
