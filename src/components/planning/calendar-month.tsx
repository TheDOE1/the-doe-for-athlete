"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CalendarSession {
  id: string;
  date: string;
  type: "field" | "gym" | "match" | "recovery";
  duration: number;
  rpeAvg?: number | null;
  hasAlert?: boolean;
}

interface CalendarMonthProps {
  sessions: CalendarSession[];
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onDayClick: (date: string) => void;
  onSessionClick: (session: CalendarSession) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SESSION_COLORS = {
  field: {
    bg: "bg-emerald-500/20 border-emerald-500/40",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    label: "Terrain",
  },
  gym: {
    bg: "bg-blue-500/20 border-blue-500/40",
    dot: "bg-blue-400",
    text: "text-blue-300",
    label: "Salle",
  },
  match: {
    bg: "bg-red-500/20 border-red-500/40",
    dot: "bg-red-400",
    text: "text-red-300",
    label: "Match",
  },
  recovery: {
    bg: "bg-zinc-500/20 border-zinc-500/40",
    dot: "bg-zinc-400",
    text: "text-zinc-300",
    label: "Récup",
  },
} as const;

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ─── Component ───────────────────────────────────────────────────────────────

export function CalendarMonth({
  sessions,
  year,
  month,
  onMonthChange,
  onDayClick,
  onSessionClick,
}: CalendarMonthProps) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]!;

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday=0
  const daysInMonth = lastDay.getDate();

  // Index sessions by date
  const sessionsByDate: Record<string, CalendarSession[]> = {};
  for (const s of sessions) {
    if (!sessionsByDate[s.date]) sessionsByDate[s.date] = [];
    sessionsByDate[s.date].push(s);
  }

  // Build grid cells (6 rows x 7 cols)
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  };
  const nextMonth = () => {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  };

  const formatDateStr = (day: number) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/80 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-white min-w-[200px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3">
          {(Object.keys(SESSION_COLORS) as (keyof typeof SESSION_COLORS)[]).map(
            (type) => (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    SESSION_COLORS[type].dot
                  )}
                />
                <span className="text-xs text-zinc-400">
                  {SESSION_COLORS[type].label}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-zinc-800/60">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="py-3 text-center text-xs font-semibold uppercase tracking-widest text-zinc-500"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[100px] border-b border-r border-zinc-800/30 bg-zinc-950/30"
              />
            );
          }

          const dateStr = formatDateStr(day);
          const daySessions = sessionsByDate[dateStr] ?? [];
          const isToday = dateStr === todayStr;
          const hasAlert = daySessions.some((s) => s.hasAlert);

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                "min-h-[100px] border-b border-r border-zinc-800/30 p-2 cursor-pointer transition-all duration-200 group",
                isToday
                  ? "bg-blue-950/30"
                  : "hover:bg-zinc-800/30"
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isToday
                      ? "bg-blue-500 text-white font-bold"
                      : "text-zinc-300 group-hover:text-white"
                  )}
                >
                  {day}
                </span>
                <div className="flex items-center gap-1">
                  {hasAlert && (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayClick(dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded p-0.5 text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Sessions */}
              <div className="flex flex-col gap-1">
                {daySessions.slice(0, 3).map((s) => {
                  const colors = SESSION_COLORS[s.type];
                  return (
                    <button
                      key={s.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionClick(s);
                      }}
                      className={cn(
                        "w-full rounded border px-1.5 py-0.5 text-left text-xs font-medium transition-all hover:brightness-110",
                        colors.bg,
                        colors.text
                      )}
                    >
                      <span className="flex items-center gap-1">
                        <span
                          className={cn("h-1.5 w-1.5 rounded-full shrink-0", colors.dot)}
                        />
                        {colors.label}
                        {s.duration && (
                          <span className="ml-auto opacity-70">{s.duration}m</span>
                        )}
                      </span>
                    </button>
                  );
                })}
                {daySessions.length > 3 && (
                  <span className="text-xs text-zinc-500 pl-1">
                    +{daySessions.length - 3} autres
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
