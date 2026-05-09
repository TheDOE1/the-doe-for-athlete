import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import {
  exerciseLibrary,
  forceVelocityProfiles,
  papComplexes,
} from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

// ─── Router ───────────────────────────────────────────────────────────────────

export const labRouter = createTRPCRouter({
  // ── Exercise Library ────────────────────────────────────────────────────────

  listExercises: protectedProcedure
    .input(
      z.object({
        category: z
          .enum([
            "strength",
            "plyometric",
            "speed",
            "agility",
            "prevention",
            "recovery",
          ])
          .optional(),
        sportSpecificity: z.enum(["low", "medium", "high"]).optional(),
        difficulty: z.number().min(1).max(5).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.category) {
        conditions.push(eq(exerciseLibrary.category, input.category));
      }
      if (input.sportSpecificity) {
        conditions.push(
          eq(exerciseLibrary.sportSpecificity, input.sportSpecificity)
        );
      }
      if (input.difficulty) {
        conditions.push(eq(exerciseLibrary.difficulty, input.difficulty));
      }

      const query = ctx.db.select().from(exerciseLibrary);
      return conditions.length > 0
        ? query.where(and(...conditions))
        : query;
    }),

  createExercise: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        category: z.enum([
          "strength",
          "plyometric",
          "speed",
          "agility",
          "prevention",
          "recovery",
        ]),
        muscleGroups: z.array(z.string()),
        equipment: z.array(z.string()),
        description: z.string().min(1),
        videoUrl: z.string().optional(),
        scienceRationale: z.string().min(1),
        difficulty: z.number().min(1).max(5),
        sportSpecificity: z.enum(["low", "medium", "high"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(exerciseLibrary)
        .values({
          name: input.name,
          category: input.category,
          muscleGroups: input.muscleGroups,
          equipment: input.equipment,
          description: input.description,
          videoUrl: input.videoUrl ?? null,
          scienceRationale: input.scienceRationale,
          difficulty: input.difficulty,
          sportSpecificity: input.sportSpecificity,
        })
        .returning();
      return result[0];
    }),

  deleteExercise: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(exerciseLibrary)
        .where(eq(exerciseLibrary.id, input.id));
      return { success: true };
    }),

  // ── Force-Velocity Profiles ─────────────────────────────────────────────────

  createFVProfile: protectedProcedure
    .input(
      z.object({
        playerId: z.string().uuid(),
        date: z.string(),
        f0: z.number(),
        v0: z.number(),
        pmax: z.number(),
        sfv: z.number(),
        drf: z.number(),
        optimalLoad: z.number().optional(),
        deficit: z.enum(["force", "velocity", "balanced"]),
        rawData: z.array(z.object({ velocity: z.number(), force: z.number() })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(forceVelocityProfiles)
        .values({
          playerId: input.playerId,
          date: input.date,
          f0: input.f0,
          v0: input.v0,
          pmax: input.pmax,
          sfv: input.sfv,
          drf: input.drf,
          optimalLoad: input.optimalLoad ?? null,
          deficit: input.deficit,
          rawData: input.rawData ?? null,
        })
        .returning();
      return result[0];
    }),

  listFVProfiles: protectedProcedure
    .input(z.object({ playerId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(forceVelocityProfiles)
        .where(eq(forceVelocityProfiles.playerId, input.playerId))
        .orderBy(sql`${forceVelocityProfiles.date} DESC`);
    }),

  // ── PAP Complexes ───────────────────────────────────────────────────────────

  listPAPComplexes: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(papComplexes);
  }),

  createPAPComplex: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        heavyExerciseId: z.string().uuid(),
        explosiveExerciseId: z.string().uuid(),
        restSeconds: z.number().min(60).max(600),
        targetQuality: z.enum(["power", "speed", "reactive_strength"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(papComplexes)
        .values({
          name: input.name,
          heavyExerciseId: input.heavyExerciseId,
          explosiveExerciseId: input.explosiveExerciseId,
          restSeconds: input.restSeconds,
          targetQuality: input.targetQuality,
        })
        .returning();
      return result[0];
    }),

  deletePAPComplex: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(papComplexes)
        .where(eq(papComplexes.id, input.id));
      return { success: true };
    }),
});
