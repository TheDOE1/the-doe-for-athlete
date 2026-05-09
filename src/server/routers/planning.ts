import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import {
  planningCycles,
  microcycles,
  trainingSessions,
  sessionLoads,
} from "../db/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const planningRouter = createTRPCRouter({
  // ── Cycles ──────────────────────────────────────────────────────────────────

  createCycle: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        type: z.enum(["macrocycle", "mesocycle"]),
        name: z.string().min(1).max(255),
        startDate: z.string(),
        endDate: z.string(),
        objective: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(planningCycles)
        .values({
          teamId: input.teamId,
          type: input.type,
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          objective: input.objective ?? null,
          notes: input.notes ?? null,
        })
        .returning();
      return result[0];
    }),

  listCycles: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(planningCycles)
        .where(eq(planningCycles.teamId, input.teamId))
        .orderBy(planningCycles.startDate);
    }),

  deleteCycle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(planningCycles)
        .where(eq(planningCycles.id, input.id));
      return { success: true };
    }),

  // ── Microcycles ──────────────────────────────────────────────────────────────

  createMicrocycle: protectedProcedure
    .input(
      z.object({
        cycleId: z.string().uuid(),
        weekNumber: z.number().min(1),
        focus: z.string().optional(),
        targetLoad: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(microcycles)
        .values({
          cycleId: input.cycleId,
          weekNumber: input.weekNumber,
          focus: input.focus ?? null,
          targetLoad: input.targetLoad ?? null,
          startDate: input.startDate ?? null,
          endDate: input.endDate ?? null,
          status: "planned",
        })
        .returning();
      return result[0];
    }),

  listMicrocycles: protectedProcedure
    .input(z.object({ cycleId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(microcycles)
        .where(eq(microcycles.cycleId, input.cycleId))
        .orderBy(microcycles.weekNumber);
    }),

  // ── Calendar view ────────────────────────────────────────────────────────────

  getCalendarMonth: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        year: z.number(),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1)
        .toISOString()
        .split("T")[0]!;
      const endDate = new Date(input.year, input.month, 0)
        .toISOString()
        .split("T")[0]!;

      const sessions = await ctx.db
        .select()
        .from(trainingSessions)
        .where(
          and(
            eq(trainingSessions.teamId, input.teamId),
            gte(trainingSessions.date, startDate),
            lte(trainingSessions.date, endDate)
          )
        )
        .orderBy(trainingSessions.date);

      return sessions;
    }),

  // ── Load summary ─────────────────────────────────────────────────────────────

  getWeeklyLoadSummary: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        weeksBack: z.number().min(1).max(26).default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - input.weeksBack * 7);

      const sessions = await ctx.db
        .select({
          id: trainingSessions.id,
          date: trainingSessions.date,
          type: trainingSessions.type,
          duration: trainingSessions.duration,
          rpeAvg: trainingSessions.rpeAvg,
        })
        .from(trainingSessions)
        .where(
          and(
            eq(trainingSessions.teamId, input.teamId),
            gte(trainingSessions.date, startDate.toISOString().split("T")[0]!)
          )
        )
        .orderBy(trainingSessions.date);

      // Group by ISO week
      const byWeek: Record<
        string,
        { week: string; totalLoad: number; sessions: typeof sessions }
      > = {};

      for (const s of sessions) {
        const d = new Date(s.date);
        const wk = getWeekNumber(d);
        const key = `${d.getFullYear()}-W${String(wk).padStart(2, "0")}`;
        if (!byWeek[key]) {
          byWeek[key] = { week: key, totalLoad: 0, sessions: [] };
        }
        const load = s.rpeAvg != null ? s.rpeAvg * s.duration : s.duration;
        byWeek[key].totalLoad += load;
        byWeek[key].sessions.push(s);
      }

      return Object.values(byWeek).sort((a, b) =>
        a.week.localeCompare(b.week)
      );
    }),

  // ── ACWR zone summary for a week ─────────────────────────────────────────────

  getWeekACWRSummary: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        weekStart: z.string(), // YYYY-MM-DD
      })
    )
    .query(async ({ ctx, input }) => {
      // Get all players for this team via session loads in the last 4 weeks
      const acuteStart = new Date(input.weekStart);
      acuteStart.setDate(acuteStart.getDate() - 7);
      const chronicStart = new Date(input.weekStart);
      chronicStart.setDate(chronicStart.getDate() - 28);
      const weekEnd = new Date(input.weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Get session loads for each player in chronic window
      const loads = await ctx.db
        .select({
          playerId: sessionLoads.playerId,
          srpe: sessionLoads.srpe,
          date: trainingSessions.date,
        })
        .from(sessionLoads)
        .innerJoin(
          trainingSessions,
          eq(sessionLoads.sessionId, trainingSessions.id)
        )
        .where(
          and(
            eq(trainingSessions.teamId, input.teamId),
            gte(
              trainingSessions.date,
              chronicStart.toISOString().split("T")[0]!
            )
          )
        );

      // Calculate per-player ACWR
      const playerMap: Record<
        string,
        { acute: number; chronic: number }
      > = {};

      for (const row of loads) {
        if (!playerMap[row.playerId]) {
          playerMap[row.playerId] = { acute: 0, chronic: 0 };
        }
        const d = new Date(row.date);
        const isAcute =
          d >= acuteStart && d <= weekEnd;
        playerMap[row.playerId].chronic += row.srpe;
        if (isAcute) {
          playerMap[row.playerId].acute += row.srpe;
        }
      }

      const summary = { green: 0, orange: 0, red: 0 };
      for (const p of Object.values(playerMap)) {
        const chronicAvg = p.chronic / 4;
        const acuteAvg = p.acute;
        const ratio = chronicAvg > 0 ? acuteAvg / chronicAvg : 1;
        if (ratio > 1.5) summary.red++;
        else if (ratio > 1.3) summary.orange++;
        else summary.green++;
      }

      return summary;
    }),
});
