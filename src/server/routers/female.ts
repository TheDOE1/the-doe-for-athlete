import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { menstrualCycleEntries, femaleScreenings } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";
import { calculateREDSRisk, getCyclePhase, getPhaseData } from "@/lib/data/female-physiology";

// ─── Female Router ────────────────────────────────────────────────────────────

export const femaleRouter = createTRPCRouter({
  // ── Cycle Entries CRUD ────────────────────────────────────────────────────

  getCycleEntries: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        limit: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(menstrualCycleEntries)
        .where(eq(menstrualCycleEntries.playerId, input.playerId))
        .orderBy(desc(menstrualCycleEntries.date))
        .limit(input.limit);
    }),

  saveCycleEntry: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        date: z.string(),
        dayOfCycle: z.number().min(1).max(60),
        symptoms: z
          .object({
            cramping: z.boolean().optional(),
            bloating: z.boolean().optional(),
            headache: z.boolean().optional(),
            moodSwings: z.boolean().optional(),
            fatigue: z.boolean().optional(),
          })
          .optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const phase = getCyclePhase(input.dayOfCycle);
      const phaseData = getPhaseData(phase);
      const trainingAdaptations = {
        intensityModifier: phaseData.trainingRecommendations.intensityModifier,
        sessionType: phaseData.trainingRecommendations.sessionTypes[0],
        hydrationPlus: parseInt(phaseData.hydration.match(/\+(\d+)/)?.[1] ?? "0"),
        warnings: phaseData.trainingRecommendations.warnings,
      };

      const result = await ctx.db
        .insert(menstrualCycleEntries)
        .values({
          playerId: input.playerId,
          date: input.date,
          phase,
          dayOfCycle: input.dayOfCycle,
          symptoms: input.symptoms ?? null,
          trainingAdaptations,
          notes: input.notes ?? null,
        })
        .returning();
      return result[0];
    }),

  // ── Phase Recommendations ────────────────────────────────────────────────

  getPhaseRecommendations: protectedProcedure
    .input(z.object({ dayOfCycle: z.number().min(1).max(60) }))
    .query(({ input }) => {
      const phase = getCyclePhase(input.dayOfCycle);
      return getPhaseData(phase);
    }),

  // ── Team Cycle Overview ───────────────────────────────────────────────────

  getTeamCycleOverview: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { players } = await import("../db/schema");
      const teamPlayers = await ctx.db
        .select()
        .from(players)
        .where(eq(players.teamId, input.teamId));

      // Only female players
      const femalePlayers = teamPlayers.filter((p) => p.sex === "female");

      const results = await Promise.all(
        femalePlayers.map(async (player) => {
          const latestCycle = await ctx.db
            .select()
            .from(menstrualCycleEntries)
            .where(eq(menstrualCycleEntries.playerId, player.id))
            .orderBy(desc(menstrualCycleEntries.date))
            .limit(1);

          const latestScreening = await ctx.db
            .select()
            .from(femaleScreenings)
            .where(eq(femaleScreenings.playerId, player.id))
            .orderBy(desc(femaleScreenings.date))
            .limit(1);

          return {
            player,
            currentCycle: latestCycle[0] ?? null,
            screening: latestScreening[0] ?? null,
          };
        })
      );

      return results;
    }),

  // ── Screening CRUD ────────────────────────────────────────────────────────

  getScreening: protectedProcedure
    .input(z.object({ playerId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select()
        .from(femaleScreenings)
        .where(eq(femaleScreenings.playerId, input.playerId))
        .orderBy(desc(femaleScreenings.date))
        .limit(5);
      return results;
    }),

  saveScreening: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        date: z.string(),
        ironLevel: z.number().optional(),
        ferritin: z.number().optional(),
        boneDensityScore: z.number().optional(),
        amenorrheaMonths: z.number().min(0).default(0),
        energyAvailability: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const redSRisk = calculateREDSRisk({
        amenorrheaMonths: input.amenorrheaMonths,
        ferritin: input.ferritin,
        boneDensityScore: input.boneDensityScore,
        energyAvailability: input.energyAvailability,
      });

      const blockHighImpact = redSRisk === "high";

      const result = await ctx.db
        .insert(femaleScreenings)
        .values({
          playerId: input.playerId,
          date: input.date,
          ironLevel: input.ironLevel,
          ferritin: input.ferritin,
          boneDensityScore: input.boneDensityScore,
          amenorrheaMonths: input.amenorrheaMonths,
          energyAvailability: input.energyAvailability,
          redSRisk,
          blockHighImpact,
          notes: input.notes ?? null,
        })
        .returning();
      return result[0];
    }),

  // ── RED-S Alerts ──────────────────────────────────────────────────────────

  getREDSAlerts: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { players } = await import("../db/schema");
      const teamPlayers = await ctx.db
        .select()
        .from(players)
        .where(eq(players.teamId, input.teamId));

      const alerts: Array<{
        player: typeof teamPlayers[number];
        screening: typeof femaleScreenings.$inferSelect;
      }> = [];

      for (const player of teamPlayers) {
        const latestScreening = await ctx.db
          .select()
          .from(femaleScreenings)
          .where(eq(femaleScreenings.playerId, player.id))
          .orderBy(desc(femaleScreenings.date))
          .limit(1);

        if (
          latestScreening[0] &&
          (latestScreening[0].redSRisk === "high" ||
            latestScreening[0].redSRisk === "moderate")
        ) {
          alerts.push({ player, screening: latestScreening[0] });
        }
      }

      return alerts;
    }),
});
