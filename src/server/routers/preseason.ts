import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { preseasonPlans, preseasonPhases } from "../db/schema";
import { eq } from "drizzle-orm";
import { generatePreseasonPhases } from "@/lib/algorithms/preseason";

// ─── Router ───────────────────────────────────────────────────────────────────

export const preseasonRouter = createTRPCRouter({
  // ── Plans ───────────────────────────────────────────────────────────────────

  createPlan: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        totalWeeks: z.number().min(4).max(12),
        startDate: z.string(),
        playerSex: z.enum(["male", "female"]),
        chronicLoadBaseline: z.number().min(0),
        hqRatio: z.number().min(0).max(1),
        weeksOff: z.number().min(0).max(20),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create plan
      const [plan] = await ctx.db
        .insert(preseasonPlans)
        .values({
          teamId: input.teamId,
          totalWeeks: input.totalWeeks,
          startDate: input.startDate,
          playerSex: input.playerSex,
          chronicLoadBaseline: input.chronicLoadBaseline,
          hqRatio: input.hqRatio,
          status: "draft",
        })
        .returning();

      if (!plan) throw new Error("Failed to create plan");

      // Auto-generate phases
      const generated = generatePreseasonPhases({
        totalWeeks: input.totalWeeks,
        startDate: input.startDate,
        playerSex: input.playerSex,
        chronicLoadBaseline: input.chronicLoadBaseline,
        hqRatio: input.hqRatio,
        weeksOff: input.weeksOff,
      });

      // Insert phases
      await ctx.db.insert(preseasonPhases).values(
        generated.phases.map((ph) => ({
          planId: plan.id,
          phaseNumber: ph.phaseNumber,
          name: ph.name,
          weeksStart: ph.weeksStart,
          weeksEnd: ph.weeksEnd,
          focus: ph.focus,
          physiologyTarget: ph.physiologyTarget,
          conditioningTarget: ph.conditioningTarget,
          keyMetrics: ph.keyMetrics,
        }))
      );

      return { plan, warnings: generated.warnings };
    }),

  listPlans: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(preseasonPlans)
        .where(eq(preseasonPlans.teamId, input.teamId))
        .orderBy(preseasonPlans.createdAt);
    }),

  getPlanWithPhases: protectedProcedure
    .input(z.object({ planId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [plan] = await ctx.db
        .select()
        .from(preseasonPlans)
        .where(eq(preseasonPlans.id, input.planId));

      if (!plan) return null;

      const phases = await ctx.db
        .select()
        .from(preseasonPhases)
        .where(eq(preseasonPhases.planId, input.planId))
        .orderBy(preseasonPhases.phaseNumber);

      return { plan, phases };
    }),

  activatePlan: protectedProcedure
    .input(z.object({ planId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(preseasonPlans)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(preseasonPlans.id, input.planId))
        .returning();
      return updated;
    }),

  completePlan: protectedProcedure
    .input(z.object({ planId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(preseasonPlans)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(preseasonPlans.id, input.planId))
        .returning();
      return updated;
    }),

  deletePlan: protectedProcedure
    .input(z.object({ planId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(preseasonPlans)
        .where(eq(preseasonPlans.id, input.planId));
      return { success: true };
    }),
});
