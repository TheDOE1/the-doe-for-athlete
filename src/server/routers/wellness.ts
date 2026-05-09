import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { wellnessEntries } from "../db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const wellnessRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        date: z.string(), // ISO date
        sleep: z.number().min(1).max(10),
        fatigue: z.number().min(1).max(10),
        soreness: z.number().min(1).max(10),
        stress: z.number().min(1).max(10),
        mood: z.number().min(1).max(10),
        hrv: z.number().nullable().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(wellnessEntries)
        .values({
          playerId: input.playerId,
          date: input.date,
          sleep: input.sleep,
          fatigue: input.fatigue,
          soreness: input.soreness,
          stress: input.stress,
          mood: input.mood,
          hrv: input.hrv ?? null,
          notes: input.notes,
        })
        .returning();
      return result[0];
    }),

  listByPlayer: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        limit: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(wellnessEntries)
        .where(eq(wellnessEntries.playerId, input.playerId))
        .orderBy(desc(wellnessEntries.date))
        .limit(input.limit);
    }),

  getTrends: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db
        .select()
        .from(wellnessEntries)
        .where(
          and(
            eq(wellnessEntries.playerId, input.playerId),
            gte(wellnessEntries.date, input.startDate),
            lte(wellnessEntries.date, input.endDate)
          )
        )
        .orderBy(wellnessEntries.date);

      // Calculate averages
      if (entries.length === 0) {
        return { entries, averages: null };
      }

      const sum = entries.reduce(
        (acc, e) => ({
          sleep: acc.sleep + e.sleep,
          fatigue: acc.fatigue + e.fatigue,
          soreness: acc.soreness + e.soreness,
          stress: acc.stress + e.stress,
          mood: acc.mood + e.mood,
        }),
        { sleep: 0, fatigue: 0, soreness: 0, stress: 0, mood: 0 }
      );

      const count = entries.length;
      const averages = {
        sleep: Math.round((sum.sleep / count) * 10) / 10,
        fatigue: Math.round((sum.fatigue / count) * 10) / 10,
        soreness: Math.round((sum.soreness / count) * 10) / 10,
        stress: Math.round((sum.stress / count) * 10) / 10,
        mood: Math.round((sum.mood / count) * 10) / 10,
      };

      return { entries, averages };
    }),
});
