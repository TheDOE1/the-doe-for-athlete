import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import {
  trainingSessions,
  sessionLoads,
} from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const sessionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        type: z.enum(["field", "gym", "match", "recovery"]),
        date: z.string(),
        duration: z.number().min(1),
        rpeAvg: z.number().min(1).max(10).optional(),
        phase: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(trainingSessions)
        .values({
          teamId: input.teamId,
          type: input.type,
          date: input.date,
          duration: input.duration,
          rpeAvg: input.rpeAvg,
          phase: input.phase,
        })
        .returning();
      return result[0];
    }),

  addLoad: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        playerId: z.string().uuid(),
        rpe: z.number().min(1).max(10),
        durationMin: z.number().min(1),
        hrData: z.any().optional(),
        gpsData: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const srpe = input.rpe * input.durationMin;
      const result = await ctx.db
        .insert(sessionLoads)
        .values({
          sessionId: input.sessionId,
          playerId: input.playerId,
          rpe: input.rpe,
          durationMin: input.durationMin,
          srpe,
          hrData: input.hrData ?? null,
          gpsData: input.gpsData ?? null,
        })
        .returning();
      return result[0];
    }),

  listByTeam: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(trainingSessions)
        .where(eq(trainingSessions.teamId, input.teamId))
        .orderBy(desc(trainingSessions.date))
        .limit(input.limit);
    }),

  getLoadsByPlayer: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        limit: z.number().min(1).max(90).default(42),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(sessionLoads)
        .where(eq(sessionLoads.playerId, input.playerId))
        .orderBy(desc(sessionLoads.createdAt))
        .limit(input.limit);
    }),
});
