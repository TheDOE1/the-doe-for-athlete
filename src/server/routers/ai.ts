import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { RESEARCH_ARTICLES, searchArticles, getArticlesByTag } from "@/lib/data/research-articles";
import { processMessage, generateConversationTitle } from "@/lib/ai/chat";
import type { ArticleTag } from "@/lib/data/research-articles";

// ─── AI Router ────────────────────────────────────────────────────────────────

export const aiRouter = createTRPCRouter({
  // ── Research Articles ─────────────────────────────────────────────────────

  listArticles: protectedProcedure
    .input(
      z.object({
        tag: z
          .enum(["récupération", "nutrition", "prévention", "performance", "femmes"])
          .optional(),
      })
    )
    .query(({ input }) => {
      if (input.tag) {
        return getArticlesByTag(input.tag as ArticleTag);
      }
      return RESEARCH_ARTICLES;
    }),

  searchArticles: protectedProcedure
    .input(z.object({ query: z.string().min(1).max(200) }))
    .query(({ input }) => {
      return searchArticles(input.query);
    }),

  // ── AI Chat ───────────────────────────────────────────────────────────────

  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(2000),
        conversationTitle: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const response = processMessage(input.message);
      const title =
        input.conversationTitle ??
        generateConversationTitle(input.message);

      return {
        title,
        role: "assistant" as const,
        content: response.content,
        sources: response.sources,
        showDisclaimer: response.showDisclaimer,
      };
    }),

  // ── Conversation Management (DB-backed, for future use) ───────────────────

  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { aiConversations } = await import("../db/schema");
      const userId = ctx.session.user.id as string;
      const result = await ctx.db
        .insert(aiConversations)
        .values({
          userId,
          title: input.title,
          context: null,
        })
        .returning();
      return result[0];
    }),

  listConversations: protectedProcedure.query(async ({ ctx }) => {
    const { aiConversations } = await import("../db/schema");
    const { eq, desc } = await import("drizzle-orm");
    const userId = ctx.session.user.id as string;
    return ctx.db
      .select()
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.createdAt))
      .limit(20);
  }),

  getConversation: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { aiConversations, aiMessages } = await import("../db/schema");
      const { eq, asc } = await import("drizzle-orm");
      const [conversation] = await ctx.db
        .select()
        .from(aiConversations)
        .where(eq(aiConversations.id, input.id))
        .limit(1);

      if (!conversation) return null;

      const messages = await ctx.db
        .select()
        .from(aiMessages)
        .where(eq(aiMessages.conversationId, input.id))
        .orderBy(asc(aiMessages.createdAt));

      return { conversation, messages };
    }),

  saveMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1),
        sources: z
          .array(
            z.object({
              title: z.string(),
              authors: z.string(),
              journal: z.string(),
              year: z.number(),
              doi: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { aiMessages } = await import("../db/schema");
      const result = await ctx.db
        .insert(aiMessages)
        .values({
          conversationId: input.conversationId,
          role: input.role,
          content: input.content,
          sources: input.sources ?? null,
        })
        .returning();
      return result[0];
    }),
});
