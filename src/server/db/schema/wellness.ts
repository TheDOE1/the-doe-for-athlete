import {
  pgTable,
  uuid,
  date,
  integer,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { players } from "./core";

// ─── Wellness Entries ────────────────────────────────────────────────────────

export const wellnessEntries = pgTable("wellness_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  sleep: integer("sleep").notNull(), // 1-10
  fatigue: integer("fatigue").notNull(), // 1-10
  soreness: integer("soreness").notNull(), // 1-10
  stress: integer("stress").notNull(), // 1-10
  mood: integer("mood").notNull(), // 1-10
  hrv: real("hrv"), // nullable, bpm
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wellnessEntriesRelations = relations(
  wellnessEntries,
  ({ one }) => ({
    player: one(players, {
      fields: [wellnessEntries.playerId],
      references: [players.id],
    }),
  })
);
