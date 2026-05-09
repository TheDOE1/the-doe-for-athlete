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
import { teams } from "./core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const playerSexEnum = pgEnum("player_sex", ["male", "female"]);

export const preseasonStatusEnum = pgEnum("preseason_status", [
  "draft",
  "active",
  "completed",
]);

// ─── Preseason Plans ──────────────────────────────────────────────────────────

export const preseasonPlans = pgTable("preseason_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  totalWeeks: integer("total_weeks").notNull(),
  startDate: date("start_date").notNull(),
  playerSex: playerSexEnum("player_sex").notNull(),
  chronicLoadBaseline: real("chronic_load_baseline").notNull(),
  hqRatio: real("hq_ratio").notNull(), // Hamstring:Quadriceps ratio (0–1)
  status: preseasonStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const preseasonPlansRelations = relations(
  preseasonPlans,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [preseasonPlans.teamId],
      references: [teams.id],
    }),
    phases: many(preseasonPhases),
  })
);

// ─── Preseason Phases ─────────────────────────────────────────────────────────

export const preseasonPhases = pgTable("preseason_phases", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => preseasonPlans.id, { onDelete: "cascade" }),
  phaseNumber: integer("phase_number").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  weeksStart: integer("weeks_start").notNull(),
  weeksEnd: integer("weeks_end").notNull(),
  focus: text("focus").notNull(),
  physiologyTarget: text("physiology_target").notNull(),
  conditioningTarget: text("conditioning_target").notNull(),
  keyMetrics: jsonb("key_metrics"), // { vmaPercent, vbtVelocity, ssgDimensions, ... }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const preseasonPhasesRelations = relations(
  preseasonPhases,
  ({ one }) => ({
    plan: one(preseasonPlans, {
      fields: [preseasonPhases.planId],
      references: [preseasonPlans.id],
    }),
  })
);
