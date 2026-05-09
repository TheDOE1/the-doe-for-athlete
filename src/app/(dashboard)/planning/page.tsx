"use client";

import { useState, useMemo } from "react";
import { CalendarMonth } from "@/components/planning/calendar-month";
import { CalendarWeek } from "@/components/planning/calendar-week";
import { SessionModal } from "@/components/planning/session-modal";
import { PeriodizationBar } from "@/components/planning/periodization-bar";
import { LoadChart } from "@/components/planning/load-chart";
import { ACWRWidget } from "@/components/planning/acwr-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  LayoutGrid,
  CalendarDays,
  Plus,
  Zap,
  Target,
  Activity,
  TrendingUp,
} from "lucide-react";
import type { CalendarSession } from "@/components/planning/calendar-month";
import type { PlanningCycle, Microcycle } from "@/components/planning/periodization-bar";
import type { SessionFormData } from "@/components/planning/session-modal";
import { cn } from "@/lib/utils";

// ─── Demo Data ───────────────────────────────────────────────────────────────

const today = new Date();
const YEAR = today.getFullYear();
const MONTH = today.getMonth() + 1;

function makeDate(offset: number) {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0]!;
}

const SESSION_TYPES = ["field", "gym", "match", "recovery"] as const;

function generateDemoSessions(): CalendarSession[] {
  const sessions: CalendarSession[] = [];
  for (let i = -45; i <= 45; i++) {
    if (Math.random() > 0.45) continue;
    const type = SESSION_TYPES[Math.floor(Math.random() * SESSION_TYPES.length)]!;
    const rpe = type === "recovery" ? 3 : type === "match" ? 8 : 5 + Math.random() * 3;
    sessions.push({
      id: `demo-${i}`,
      date: makeDate(i),
      type,
      duration: type === "match" ? 95 : type === "recovery" ? 30 : 60 + Math.floor(Math.random() * 60),
      rpeAvg: Math.round(rpe * 10) / 10,
      hasAlert: type !== "recovery" && Math.random() > 0.85,
    });
  }
  return sessions;
}

const DEMO_SESSIONS = generateDemoSessions();

const DEMO_MACRO: PlanningCycle = {
  id: "macro-1",
  type: "macrocycle",
  name: "Saison 2024-2025",
  startDate: `${YEAR}-08-01`,
  endDate: `${YEAR + 1}-06-30`,
  objective: "Qualification Ligue des Champions + Top 3 championnat",
};

const DEMO_MESOS: PlanningCycle[] = [
  {
    id: "meso-1",
    type: "mesocycle",
    name: "Pré-saison",
    startDate: `${YEAR}-08-01`,
    endDate: `${YEAR}-09-14`,
  },
  {
    id: "meso-2",
    type: "mesocycle",
    name: "Bloc 1",
    startDate: `${YEAR}-09-15`,
    endDate: `${YEAR}-11-02`,
  },
  {
    id: "meso-3",
    type: "mesocycle",
    name: "Bloc 2",
    startDate: `${YEAR}-11-03`,
    endDate: `${YEAR}-12-21`,
  },
  {
    id: "meso-4",
    type: "mesocycle",
    name: "Hiver",
    startDate: `${YEAR + 1}-01-06`,
    endDate: `${YEAR + 1}-02-22`,
  },
  {
    id: "meso-5",
    type: "mesocycle",
    name: "Fin de saison",
    startDate: `${YEAR + 1}-02-23`,
    endDate: `${YEAR + 1}-06-30`,
  },
];

function getMonday(d: Date) {
  const day = d.getDay() || 7;
  const diff = d.getDate() - day + 1;
  return new Date(d.setDate(diff));
}

const DEMO_MICROCYCLES: Microcycle[] = Array.from({ length: 8 }, (_, i) => ({
  id: `micro-${i + 1}`,
  cycleId: i < 3 ? "meso-2" : "meso-3",
  weekNumber: i + 1,
  focus: ["Endurance", "Force", "Vitesse", "Mixte", "Match", "Récup", "Intensité", "Taper"][i] ?? "Mixte",
  targetLoad: 2500 + Math.random() * 1000,
  actualLoad: i < 5 ? 2200 + Math.random() * 1200 : undefined,
  status: i < 4 ? "completed" : i === 4 ? "active" : "planned",
  startDate: makeDate((i - 4) * 7),
}));

function generateWeeklyLoad() {
  return Array.from({ length: 12 }, (_, i) => {
    const weekDate = new Date(today);
    weekDate.setDate(weekDate.getDate() - (11 - i) * 7);
    const yr = weekDate.getFullYear();
    const wk = Math.ceil(
      ((weekDate.getTime() - new Date(yr, 0, 1).getTime()) / 86400000 +
        new Date(yr, 0, 1).getDay() +
        1) /
        7
    );
    const load = 1800 + Math.random() * 1600;
    return {
      week: `S${wk}`,
      totalLoad: Math.round(load),
      planned: Math.round(load * (0.85 + Math.random() * 0.3)),
    };
  });
}

const DEMO_WEEKLY_LOAD = generateWeeklyLoad();

// ─── Page ─────────────────────────────────────────────────────────────────────

type ViewMode = "month" | "week";

export default function PlanningPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [calYear, setCalYear] = useState(YEAR);
  const [calMonth, setCalMonth] = useState(MONTH);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sessions, setSessions] = useState<CalendarSession[]>(DEMO_SESSIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current week for week view
  const weekStart = useMemo(() => {
    const d = getMonday(new Date(today));
    return d;
  }, []);

  // Sessions in current month
  const monthSessions = useMemo(() => {
    const prefix = `${calYear}-${String(calMonth).padStart(2, "0")}`;
    return sessions.filter((s) => s.date.startsWith(prefix));
  }, [sessions, calYear, calMonth]);

  // Sessions in current week
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
  }, [weekStart]);

  const weekSessions = useMemo(() => {
    const start = weekStart.toISOString().split("T")[0]!;
    const end = weekEnd.toISOString().split("T")[0]!;
    return sessions.filter((s) => s.date >= start && s.date <= end);
  }, [sessions, weekStart, weekEnd]);

  // Demo ACWR zones
  const demoACWR = useMemo(() => {
    const total = 6 + Math.floor(Math.random() * 10);
    const red = Math.floor(Math.random() * 2);
    const orange = Math.floor(Math.random() * 3);
    return { green: total - red - orange, orange, red };
  }, []);

  // Stats
  const totalThisMonth = monthSessions.length;
  const matchCount = monthSessions.filter((s) => s.type === "match").length;
  const avgRPE =
    monthSessions.filter((s) => s.rpeAvg != null).length > 0
      ? (
          monthSessions
            .filter((s) => s.rpeAvg != null)
            .reduce((sum, s) => sum + (s.rpeAvg ?? 0), 0) /
          monthSessions.filter((s) => s.rpeAvg != null).length
        ).toFixed(1)
      : "—";

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setShowSessionModal(true);
  };

  const handleCreateSession = async (data: SessionFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 600));

    const newSession: CalendarSession = {
      id: `new-${Date.now()}`,
      date: data.date,
      type: data.type,
      duration: data.duration,
      rpeAvg: data.rpeAvg ?? null,
    };
    setSessions((prev) => [...prev, newSession]);
    setShowSessionModal(false);
    setSelectedDate(null);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Matrice de Planification
          </h1>
          <p className="mt-1 text-zinc-400">
            Calendrier dynamique, périodisation & monitoring ACWR
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" className="gap-1">
            <Calendar className="h-3 w-3" />
            Phase 2 Active
          </Badge>
          <Button
            onClick={() => setShowSessionModal(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Nouvelle session
          </Button>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card glass className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Sessions ce mois</p>
              <p className="text-2xl font-bold text-white">{totalThisMonth}</p>
            </div>
          </div>
        </Card>
        <Card glass className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <Target className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Matchs</p>
              <p className="text-2xl font-bold text-white">{matchCount}</p>
            </div>
          </div>
        </Card>
        <Card glass className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">RPE Moyen</p>
              <p className="text-2xl font-bold text-white">{avgRPE}</p>
            </div>
          </div>
        </Card>
        <Card glass className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">En zone verte</p>
              <p className="text-2xl font-bold text-emerald-400">
                {demoACWR.green}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Periodization ──────────────────────────── */}
      <PeriodizationBar
        cycles={[DEMO_MACRO, ...DEMO_MESOS]}
        microcycles={DEMO_MICROCYCLES}
      />

      {/* ── View toggle ────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode("month")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            viewMode === "month"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Mois
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            viewMode === "week"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          )}
        >
          <CalendarDays className="h-4 w-4" />
          Semaine
        </button>
      </div>

      {/* ── Calendar / Week view ───────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="xl:col-span-3">
          {viewMode === "month" ? (
            <CalendarMonth
              sessions={monthSessions}
              year={calYear}
              month={calMonth}
              onMonthChange={(y, m) => {
                setCalYear(y);
                setCalMonth(m);
              }}
              onDayClick={handleDayClick}
              onSessionClick={(s) => {
                console.log("Session clicked:", s);
              }}
            />
          ) : (
            <CalendarWeek
              weekStart={weekStart}
              sessions={weekSessions}
              acwr={demoACWR}
              onSessionClick={(s) => {
                console.log("Session clicked:", s);
              }}
            />
          )}
        </div>

        {/* ── Right sidebar ──────────────────────────── */}
        <div className="xl:col-span-1 space-y-4">
          <ACWRWidget
            zones={demoACWR}
            weekLabel={`Semaine du ${weekStart.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}`}
          />

          {/* Quick create */}
          <Card glass className="p-4">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4 text-blue-400" />
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-2">
              {(["field", "gym", "match", "recovery"] as const).map((type) => {
                const labels = {
                  field: { label: "Session terrain", icon: "⚽", color: "text-emerald-400 border-emerald-700/40 hover:border-emerald-500/50 hover:bg-emerald-900/20" },
                  gym: { label: "Session salle", icon: "🏋️", color: "text-blue-400 border-blue-700/40 hover:border-blue-500/50 hover:bg-blue-900/20" },
                  match: { label: "Match", icon: "🏆", color: "text-red-400 border-red-700/40 hover:border-red-500/50 hover:bg-red-900/20" },
                  recovery: { label: "Récupération", icon: "💤", color: "text-zinc-400 border-zinc-700/40 hover:border-zinc-500/50 hover:bg-zinc-800/30" },
                };
                const cfg = labels[type];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedDate(today.toISOString().split("T")[0] ?? null);
                      setShowSessionModal(true);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                      cfg.color
                    )}
                  >
                    <span>{cfg.icon}</span>
                    {cfg.label}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Load chart ─────────────────────────────── */}
      <LoadChart data={DEMO_WEEKLY_LOAD} />

      {/* ── Session Modal ──────────────────────────── */}
      {showSessionModal && (
        <SessionModal
          initialDate={selectedDate ?? undefined}
          onClose={() => {
            setShowSessionModal(false);
            setSelectedDate(null);
          }}
          onSubmit={handleCreateSession}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
