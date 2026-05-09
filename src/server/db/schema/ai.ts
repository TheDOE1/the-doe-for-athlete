import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  pgEnum,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const messageRoleEnum = pgEnum("ai_message_role", [
  "user",
  "assistant",
  "system",
]);

export const embeddingStatusEnum = pgEnum("embedding_status", [
  "pending",
  "done",
]);

// ─── AI Conversations ─────────────────────────────────────────────────────────

export const aiConversations = pgTable("ai_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  context: jsonb("context"), // { sport, teamName, specialization, etc. }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const aiConversationsRelations = relations(
  aiConversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [aiConversations.userId],
      references: [users.id],
    }),
    messages: many(aiMessages),
  })
);

// ─── AI Messages ──────────────────────────────────────────────────────────────

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => aiConversations.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  sources: jsonb("sources"), // [{ title, authors, journal, year, doi }]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiMessages.conversationId],
    references: [aiConversations.id],
  }),
}));

// ─── Research Articles ────────────────────────────────────────────────────────

export const researchArticles = pgTable("research_articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").array().notNull(),
  journal: varchar("journal", { length: 255 }).notNull(),
  year: integer("year").notNull(),
  abstract: text("abstract").notNull(), // Vulgarized summary
  doi: varchar("doi", { length: 255 }),
  url: text("url"),
  tags: text("tags").array().notNull().default([]),
  embeddingStatus: embeddingStatusEnum("embedding_status")
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
