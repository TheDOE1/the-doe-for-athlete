"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, Layers, Grid3X3 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlanningCycle {
  id: string;
  type: "macrocycle" | "mesocycle";
  name: string;
  startDate: string;
  endDate: string;
  objective?: string | null;
}

export interface Microcycle {
  id: string;
  cycleId: string;
  weekNumber: number;
  focus?: string | null;
  targetLoad?: number | null;
  actualLoad?: number | null;
  status: "planned" | "active" | "completed";
  startDate?: string | null;
}

interface PeriodizationBarProps {
  cycles: PlanningCycle[];
  microcycles: Microcycle[];
  currentDate?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysBetween(a: string, b: string) {
  return Math.max(
    0,
    Math.round(
      (new Date(b).getTime() - new Date(a).getTime()) / 86400000
    )
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PeriodizationBar({
  cycles,
  microcycles,
  currentDate,
}: PeriodizationBarProps) {
  const today = currentDate ?? new Date().toISOString().split("T")[0]!;

  // Find macrocycle (the biggest one / type=macrocycle)
  const macro = cycles.find((c) => c.type === "macrocycle");
  const mesos = cycles.filter((c) => c.type === "mesocycle");

  if (!macro) {
    return (
      <Card glass className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" />
            Périodisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 text-center py-4">
            Aucun macrocycle défini — créez un cycle pour visualiser la périodisation.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalDays = daysBetween(macro.startDate, macro.endDate);
  if (totalDays === 0) return null;

  const pct = (date: string, from = macro.startDate) => {
    const d = daysBetween(from, date);
    return clamp((d / totalDays) * 100, 0, 100);
  };

  const todayPct = pct(today);

  // Status color for microcycles
  const microStatusColor: Record<string, string> = {
    planned: "bg-zinc-600",
    active: "bg-blue-500",
    completed: "bg-emerald-500",
  };

  return (
    <Card glass className="overflow-hidden p-0">
      <CardHeader className="px-6 py-4 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-400" />
            Périodisation — {macro.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="info" className="gap-1">
              <Flag className="h-3 w-3" />
              {macro.startDate}
            </Badge>
            <span className="text-zinc-600">→</span>
            <Badge variant="info" className="gap-1">
              <Flag className="h-3 w-3" />
              {macro.endDate}
            </Badge>
          </div>
        </div>
        {macro.objective && (
          <p className="text-sm text-zinc-400 mt-1">{macro.objective}</p>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* ── Macrocycle bar ────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Flag className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
              Macrocycle
            </span>
          </div>
          <div className="relative h-8 rounded-xl bg-zinc-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-purple-700/30 rounded-xl" />
            {/* Today marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/80"
              style={{ left: `${todayPct}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white" />
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <span className="text-xs text-purple-200 font-semibold">
                {macro.name}
              </span>
              <span className="text-xs text-purple-300">
                {Math.round(todayPct)}% écoulé
              </span>
            </div>
          </div>
        </div>

        {/* ── Mésocycles bar ────────────────────────── */}
        {mesos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Mésocycles
              </span>
            </div>
            <div className="relative h-10 rounded-xl bg-zinc-800 overflow-hidden">
              {mesos.map((meso, i) => {
                const left = pct(meso.startDate);
                const right = pct(meso.endDate);
                const width = right - left;
                if (width <= 0) return null;

                const isActive =
                  meso.startDate <= today && meso.endDate >= today;
                return (
                  <div
                    key={meso.id}
                    className={cn(
                      "absolute top-1 bottom-1 rounded-lg transition-all",
                      isActive
                        ? "bg-blue-500/50 border border-blue-500/70"
                        : "bg-blue-900/40 border border-blue-800/40"
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    <div className="h-full flex items-center justify-center overflow-hidden px-2">
                      <span
                        className={cn(
                          "text-xs font-medium truncate",
                          isActive ? "text-blue-200" : "text-blue-400"
                        )}
                      >
                        {meso.name}
                      </span>
                    </div>
                  </div>
                );
              })}
              {/* Today marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/60 pointer-events-none"
                style={{ left: `${todayPct}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Microcycles ───────────────────────────── */}
        {microcycles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                Microcycles
              </span>
              <span className="text-xs text-zinc-500">
                ({microcycles.length} semaines)
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {microcycles.map((micro) => {
                const isActive = micro.status === "active";
                const isDone = micro.status === "completed";

                return (
                  <div
                    key={micro.id}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs transition-all",
                      isActive
                        ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                        : isDone
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-zinc-700/60 bg-zinc-800/40 text-zinc-500"
                    )}
                  >
                    <div className="font-semibold">S{micro.weekNumber}</div>
                    {micro.focus && (
                      <div className="opacity-70 truncate max-w-[80px]">
                        {micro.focus}
                      </div>
                    )}
                    {micro.targetLoad && (
                      <div className="mt-1 flex items-center gap-1">
                        <div
                          className={cn(
                            "h-1.5 rounded-full",
                            microStatusColor[micro.status]
                          )}
                          style={{
                            width: `${Math.min(
                              100,
                              ((micro.actualLoad ?? 0) / micro.targetLoad) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
