"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import type { CalendarSession } from "./calendar-month";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeekACWR {
  green: number;
  orange: number;
  red: number;
}

interface CalendarWeekProps {
  weekStart: Date;
  sessions: CalendarSession[];
  acwr?: WeekACWR;
  onSessionClick: (session: CalendarSession) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SESSION_TYPE_CONFIG = {
  field: {
    bg: "bg-emerald-500/20 border-l-4 border-emerald-500",
    text: "text-emerald-300",
    icon: "⚽",
    label: "Terrain",
  },
  gym: {
    bg: "bg-blue-500/20 border-l-4 border-blue-500",
    text: "text-blue-300",
    icon: "🏋️",
    label: "Salle",
  },
  match: {
    bg: "bg-red-500/20 border-l-4 border-red-500",
    text: "text-red-300",
    icon: "🏆",
    label: "Match",
  },
  recovery: {
    bg: "bg-zinc-500/20 border-l-4 border-zinc-500",
    text: "text-zinc-300",
    icon: "💤",
    label: "Récupération",
  },
} as const;

const DAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ─── Component ───────────────────────────────────────────────────────────────

export function CalendarWeek({
  weekStart,
  sessions,
  acwr,
  onSessionClick,
}: CalendarWeekProps) {
  const today = new Date().toISOString().split("T")[0]!;

  // Build 7 days from weekStart
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Index sessions by date
  const byDate: Record<string, CalendarSession[]> = {};
  for (const s of sessions) {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  }

  // Compute total weekly load
  const totalLoad = sessions.reduce((sum, s) => {
    return sum + (s.rpeAvg != null ? s.rpeAvg * s.duration : s.duration);
  }, 0);

  const totalPlayers = (acwr?.green ?? 0) + (acwr?.orange ?? 0) + (acwr?.red ?? 0);

  return (
    <Card glass className="overflow-hidden p-0">
      <CardHeader className="px-6 py-4 border-b border-zinc-800/60">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Vue Semaine — Microcycle
          </CardTitle>
          <div className="flex items-center gap-2">
            {acwr && totalPlayers > 0 && (
              <>
                {acwr.green > 0 && (
                  <Badge variant="success" className="gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {acwr.green} vert
                  </Badge>
                )}
                {acwr.orange > 0 && (
                  <Badge variant="warning" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {acwr.orange} orange
                  </Badge>
                )}
                {acwr.red > 0 && (
                  <Badge variant="danger" className="gap-1 animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    {acwr.red} rouge
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Stats row */}
        <div className="grid grid-cols-3 border-b border-zinc-800/60">
          <div className="px-6 py-3 flex items-center gap-2 border-r border-zinc-800/60">
            <Zap className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-xs text-zinc-500">Charge totale</p>
              <p className="text-lg font-bold text-white">
                {Math.round(totalLoad).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="px-6 py-3 flex items-center gap-2 border-r border-zinc-800/60">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-xs text-zinc-500">Sessions</p>
              <p className="text-lg font-bold text-white">{sessions.length}</p>
            </div>
          </div>
          <div className="px-6 py-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-xs text-zinc-500">RPE moyen</p>
              <p className="text-lg font-bold text-white">
                {sessions.length > 0
                  ? (
                      sessions
                        .filter((s) => s.rpeAvg != null)
                        .reduce((sum, s) => sum + (s.rpeAvg ?? 0), 0) /
                      Math.max(1, sessions.filter((s) => s.rpeAvg != null).length)
                    ).toFixed(1)
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Day columns */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dateStr = day.toISOString().split("T")[0]!;
            const daySessions = byDate[dateStr] ?? [];
            const isToday = dateStr === today;

            // Load bar height
            const dayLoad = daySessions.reduce(
              (s, sess) =>
                s + (sess.rpeAvg != null ? sess.rpeAvg * sess.duration : sess.duration),
              0
            );
            const maxLoad = 600;
            const barHeight = Math.min(100, (dayLoad / maxLoad) * 100);

            return (
              <div
                key={dateStr}
                className={cn(
                  "border-r border-zinc-800/60 last:border-r-0",
                  isToday ? "bg-blue-950/20" : ""
                )}
              >
                {/* Day label */}
                <div
                  className={cn(
                    "px-2 py-2 text-center border-b border-zinc-800/60",
                    isToday ? "bg-blue-900/30" : ""
                  )}
                >
                  <p className="text-xs text-zinc-500 font-medium">
                    {DAY_SHORT[i]}
                  </p>
                  <p
                    className={cn(
                      "text-base font-bold",
                      isToday ? "text-blue-400" : "text-zinc-200"
                    )}
                  >
                    {day.getDate()}
                  </p>
                </div>

                {/* Load bar */}
                <div className="px-2 pt-2 pb-1">
                  <div className="h-16 rounded bg-zinc-800/60 relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                      style={{ height: `${barHeight}%` }}
                    />
                    {dayLoad > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {Math.round(dayLoad)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sessions */}
                <div className="px-1.5 pb-2 flex flex-col gap-1">
                  {daySessions.map((s) => {
                    const cfg = SESSION_TYPE_CONFIG[s.type];
                    return (
                      <button
                        key={s.id}
                        onClick={() => onSessionClick(s)}
                        className={cn(
                          "w-full rounded p-1.5 text-left text-xs transition-all hover:brightness-110",
                          cfg.bg,
                          cfg.text
                        )}
                      >
                        <div className="font-semibold">{cfg.label}</div>
                        <div className="opacity-70">{s.duration}min</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
