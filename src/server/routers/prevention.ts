import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import {
  acwrRecords,
  preventionProtocols,
  injuryRecords,
} from "../db/schema";
import { eq, desc, and } from "drizzle-orm";

export const preventionRouter = createTRPCRouter({
  // ─── ACWR ────────────────────────────────────────────────────────────────────

  getACWR: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        limit: z.number().min(1).max(90).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(acwrRecords)
        .where(eq(acwrRecords.playerId, input.playerId))
        .orderBy(desc(acwrRecords.date))
        .limit(input.limit);
    }),

  getTeamACWR: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Get latest ACWR for all players in a team
      // Using a subquery approach - get all players then their latest ACWR
      const { players } = await import("../db/schema");
      const teamPlayers = await ctx.db
        .select()
        .from(players)
        .where(eq(players.teamId, input.teamId));

      const results = await Promise.all(
        teamPlayers.map(async (player) => {
          const latest = await ctx.db
            .select()
            .from(acwrRecords)
            .where(eq(acwrRecords.playerId, player.id))
            .orderBy(desc(acwrRecords.date))
            .limit(1);

          return {
            player,
            acwr: latest[0] ?? null,
          };
        })
      );

      return results;
    }),

  listAlerts: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { players } = await import("../db/schema");
      const teamPlayers = await ctx.db
        .select()
        .from(players)
        .where(eq(players.teamId, input.teamId));

      const alerts: Array<{
        player: typeof teamPlayers[number];
        acwr: typeof acwrRecords.$inferSelect;
      }> = [];

      for (const player of teamPlayers) {
        const latest = await ctx.db
          .select()
          .from(acwrRecords)
          .where(eq(acwrRecords.playerId, player.id))
          .orderBy(desc(acwrRecords.date))
          .limit(1);

        if (latest[0] && (latest[0].zone === "red" || latest[0].zone === "orange")) {
          alerts.push({ player, acwr: latest[0] });
        }
      }

      return alerts;
    }),

  // ─── ACWR Record Creation ────────────────────────────────────────────────────

  saveACWR: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        date: z.string(),
        acuteLoad: z.number(),
        chronicLoad: z.number(),
        ratio: z.number(),
        zone: z.enum(["green", "orange", "red"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(acwrRecords)
        .values(input)
        .returning();
      return result[0];
    }),

  // ─── Protocols ───────────────────────────────────────────────────────────────

  getProtocols: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(preventionProtocols)
        .where(eq(preventionProtocols.playerId, input.playerId))
        .orderBy(desc(preventionProtocols.createdAt));
    }),

  createProtocol: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        type: z.enum(["nordic", "copenhagen", "reverse_nordic"]),
        exercises: z.array(
          z.object({
            name: z.string(),
            sets: z.number(),
            reps: z.number(),
            load: z.string().optional(),
          })
        ),
        frequency: z.number().min(1).max(7),
        startDate: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(preventionProtocols)
        .values({
          playerId: input.playerId,
          type: input.type,
          exercises: input.exercises,
          frequency: input.frequency,
          startDate: input.startDate,
        })
        .returning();
      return result[0];
    }),

  updateProtocolCompliance: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        complianceRate: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .update(preventionProtocols)
        .set({
          complianceRate: input.complianceRate,
          updatedAt: new Date(),
        })
        .where(eq(preventionProtocols.id, input.id))
        .returning();
      return result[0];
    }),

  // ─── Injuries ────────────────────────────────────────────────────────────────

  getInjuries: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(injuryRecords)
        .where(eq(injuryRecords.playerId, input.playerId))
        .orderBy(desc(injuryRecords.startDate));
    }),

  createInjury: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        type: z.string(),
        location: z.string(),
        mechanism: z.string().optional(),
        severity: z.enum(["minor", "moderate", "severe"]),
        startDate: z.string(),
        returnDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(injuryRecords)
        .values(input)
        .returning();
      return result[0];
    }),

  listInjuriesByTeam: protectedProcedure
    .input(
      z.object({
        teamId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { players } = await import("../db/schema");
      const teamPlayers = await ctx.db
        .select({ id: players.id })
        .from(players)
        .where(eq(players.teamId, input.teamId));

      if (teamPlayers.length === 0) return [];

      const { inArray } = await import("drizzle-orm");
      const playerIds = teamPlayers.map((p) => p.id);

      return ctx.db
        .select()
        .from(injuryRecords)
        .where(inArray(injuryRecords.playerId, playerIds))
        .orderBy(desc(injuryRecords.startDate))
        .limit(input.limit);
    }),
});
