import {
  pgTable,
  uuid,
  date,
  integer,
  real,
  text,
  varchar,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teams } from "./core";
import { trainingSessions } from "./training";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const cycleTypeEnum = pgEnum("cycle_type", [
  "macrocycle",
  "mesocycle",
]);

export const microcycleStatusEnum = pgEnum("microcycle_status", [
  "planned",
  "active",
  "completed",
]);

// ─── Planning Cycles ─────────────────────────────────────────────────────────

export const planningCycles = pgTable("planning_cycles", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  type: cycleTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  objective: text("objective"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const planningCyclesRelations = relations(
  planningCycles,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [planningCycles.teamId],
      references: [teams.id],
    }),
    microcycles: many(microcycles),
  })
);

// ─── Microcycles ─────────────────────────────────────────────────────────────

export const microcycles = pgTable("microcycles", {
  id: uuid("id").defaultRandom().primaryKey(),
  cycleId: uuid("cycle_id")
    .notNull()
    .references(() => planningCycles.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull(),
  focus: varchar("focus", { length: 255 }),
  targetLoad: real("target_load"),
  actualLoad: real("actual_load"),
  status: microcycleStatusEnum("status").default("planned").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const microcyclesRelations = relations(microcycles, ({ one, many }) => ({
  cycle: one(planningCycles, {
    fields: [microcycles.cycleId],
    references: [planningCycles.id],
  }),
  sessions: many(trainingSessions),
}));

// ─── Extend TrainingSession with microcycle reference ────────────────────────
// Note: We use the existing `phase` field in trainingSessions to store a
// logical link, and we add a proper foreign key via microcycleId below.
// Since we can't alter the existing table in schema, we do it via a view-level
// join in the router. The microcycle_id is tracked in a new table.

export const sessionMicrocycleMap = pgTable("session_microcycle_map", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => trainingSessions.id, { onDelete: "cascade" }),
  microcycleId: uuid("microcycle_id")
    .notNull()
    .references(() => microcycles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionMicrocycleMapRelations = relations(
  sessionMicrocycleMap,
  ({ one }) => ({
    session: one(trainingSessions, {
      fields: [sessionMicrocycleMap.sessionId],
      references: [trainingSessions.id],
    }),
    microcycle: one(microcycles, {
      fields: [sessionMicrocycleMap.microcycleId],
      references: [microcycles.id],
    }),
  })
);
