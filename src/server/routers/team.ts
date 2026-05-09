import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { teams } from "../db/schema";
import { eq } from "drizzle-orm";

export const teamRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(teams);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(teams)
        .where(eq(teams.id, input.id));
      return result[0] ?? null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        sport: z.string().default("football"),
        season: z.string().optional(),
        organizationId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(teams).values(input).returning();
      return result[0];
    }),
});
