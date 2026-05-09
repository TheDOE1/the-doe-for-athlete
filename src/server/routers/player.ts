import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { players } from "../db/schema";
import { eq } from "drizzle-orm";

export const playerRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(players)
        .where(eq(players.teamId, input.teamId));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(players)
        .where(eq(players.id, input.id));
      return result[0] ?? null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        position: z.string().optional(),
        birthDate: z.string().optional(),
        sex: z.enum(["male", "female"]).optional(),
        height: z.string().optional(),
        weight: z.string().optional(),
        teamId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .insert(players)
        .values({
          firstName: input.firstName,
          lastName: input.lastName,
          position: input.position,
          birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
          sex: input.sex,
          height: input.height,
          weight: input.weight,
          teamId: input.teamId,
        })
        .returning();
      return result[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        position: z.string().optional(),
        birthDate: z.string().optional(),
        sex: z.enum(["male", "female"]).optional(),
        height: z.string().optional(),
        weight: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, birthDate, ...rest } = input;
      const result = await ctx.db
        .update(players)
        .set({
          ...rest,
          ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
        })
        .where(eq(players.id, id))
        .returning();
      return result[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(players).where(eq(players.id, input.id));
      return { success: true };
    }),
});
