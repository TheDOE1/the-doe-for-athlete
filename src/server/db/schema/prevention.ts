import {
  pgTable,
  uuid,
  date,
  real,
  text,
  integer,
  jsonb,
  pgEnum,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { players } from "./core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const acwrZoneEnum = pgEnum("acwr_zone", [
  "green",
  "orange",
  "red",
]);

export const protocolTypeEnum = pgEnum("protocol_type", [
  "nordic",
  "copenhagen",
  "reverse_nordic",
]);

export const injurySeverityEnum = pgEnum("injury_severity", [
  "minor",
  "moderate",
  "severe",
]);

// ─── ACWR Records ────────────────────────────────────────────────────────────

export const acwrRecords = pgTable("acwr_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  acuteLoad: real("acute_load").notNull(),
  chronicLoad: real("chronic_load").notNull(),
  ratio: real("ratio").notNull(),
  zone: acwrZoneEnum("zone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const acwrRecordsRelations = relations(acwrRecords, ({ one }) => ({
  player: one(players, {
    fields: [acwrRecords.playerId],
    references: [players.id],
  }),
}));

// ─── Injury Records ──────────────────────────────────────────────────────────

export const injuryRecords = pgTable("injury_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(), // e.g. "muscular", "ligament"
  location: varchar("location", { length: 100 }).notNull(), // e.g. "hamstring_left"
  mechanism: text("mechanism"), // how it happened
  severity: injurySeverityEnum("severity").notNull(),
  startDate: date("start_date").notNull(),
  returnDate: date("return_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const injuryRecordsRelations = relations(injuryRecords, ({ one }) => ({
  player: one(players, {
    fields: [injuryRecords.playerId],
    references: [players.id],
  }),
}));

// ─── Prevention Protocols ────────────────────────────────────────────────────

export const preventionProtocols = pgTable("prevention_protocols", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  type: protocolTypeEnum("type").notNull(),
  exercises: jsonb("exercises").notNull(), // [{ name, sets, reps, load }]
  frequency: integer("frequency").notNull(), // times per week
  complianceRate: real("compliance_rate").default(0), // 0-100
  startDate: date("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const preventionProtocolsRelations = relations(
  preventionProtocols,
  ({ one }) => ({
    player: one(players, {
      fields: [preventionProtocols.playerId],
      references: [players.id],
    }),
  })
);
