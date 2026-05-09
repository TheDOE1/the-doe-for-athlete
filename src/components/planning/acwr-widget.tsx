"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, CheckCircle2, Circle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ACWRZones {
  green: number;
  orange: number;
  red: number;
}

interface ACWRWidgetProps {
  zones: ACWRZones;
  weekLabel?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ACWRWidget({ zones, weekLabel }: ACWRWidgetProps) {
  const total = zones.green + zones.orange + zones.red;

  const greenPct = total > 0 ? (zones.green / total) * 100 : 0;
  const orangePct = total > 0 ? (zones.orange / total) * 100 : 0;
  const redPct = total > 0 ? (zones.red / total) * 100 : 0;

  return (
    <Card glass className="p-0 overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-blue-400" />
            ACWR Équipe
          </CardTitle>
          {weekLabel && (
            <span className="text-xs text-zinc-500">{weekLabel}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 py-4 space-y-4">
        {/* Stacked bar */}
        {total > 0 ? (
          <>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-800">
              {greenPct > 0 && (
                <div
                  className="h-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${greenPct}%` }}
                />
              )}
              {orangePct > 0 && (
                <div
                  className="h-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${orangePct}%` }}
                />
              )}
              {redPct > 0 && (
                <div
                  className="h-full bg-red-500 transition-all duration-700"
                  style={{ width: `${redPct}%` }}
                />
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mb-1" />
                <span className="text-2xl font-bold text-emerald-400">
                  {zones.green}
                </span>
                <span className="text-xs text-emerald-500 font-medium">Vert</span>
                <span className="text-xs text-zinc-600">0.8–1.3</span>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <AlertTriangle className="h-4 w-4 text-amber-400 mb-1" />
                <span className="text-2xl font-bold text-amber-400">
                  {zones.orange}
                </span>
                <span className="text-xs text-amber-500 font-medium">Orange</span>
                <span className="text-xs text-zinc-600">1.3–1.5</span>
              </div>
              <div
                className={cn(
                  "flex flex-col items-center rounded-xl border p-3",
                  zones.red > 0
                    ? "border-red-500/30 bg-red-500/10 animate-pulse"
                    : "border-zinc-700/40 bg-zinc-800/20"
                )}
              >
                <Circle
                  className={cn(
                    "h-4 w-4 mb-1",
                    zones.red > 0 ? "text-red-400" : "text-zinc-600"
                  )}
                />
                <span
                  className={cn(
                    "text-2xl font-bold",
                    zones.red > 0 ? "text-red-400" : "text-zinc-600"
                  )}
                >
                  {zones.red}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    zones.red > 0 ? "text-red-500" : "text-zinc-600"
                  )}
                >
                  Rouge
                </span>
                <span className="text-xs text-zinc-600">&gt;1.5</span>
              </div>
            </div>

            {/* Alert message */}
            {zones.red > 0 && (
              <div className="rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-2">
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {zones.red} joueur{zones.red > 1 ? "s" : ""} en zone rouge —
                  réduire la charge cette semaine
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-2">
            Aucune donnée ACWR cette semaine
          </p>
        )}
      </CardContent>
    </Card>
  );
}
