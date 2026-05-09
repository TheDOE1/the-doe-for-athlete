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
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { players } from "./core";

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY NOTE: These tables contain sensitive medical data.
// In production, all PII fields (symptoms, notes, screening results) MUST be
// encrypted at rest (AES-256 or column-level encryption via pgcrypto).
// Access should be restricted to roles: physio, head_coach, admin.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enums ───────────────────────────────────────────────────────────────────

export const cyclePhaseEnum = pgEnum("cycle_phase", [
  "follicular",
  "ovulatory",
  "luteal",
  "menstrual",
]);

export const redSRiskEnum = pgEnum("reds_risk", ["low", "moderate", "high"]);

// ─── Menstrual Cycle Entries ──────────────────────────────────────────────────

export const menstrualCycleEntries = pgTable("menstrual_cycle_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  phase: cyclePhaseEnum("phase").notNull(),
  dayOfCycle: integer("day_of_cycle").notNull(), // 1–28+ (varies per person)
  // SECURITY: Encrypt in production — personal health data
  symptoms: jsonb("symptoms"), // { cramping: bool, bloating: bool, headache: bool, moodSwings: bool, fatigue: bool }
  trainingAdaptations: jsonb("training_adaptations"), // { intensityModifier: -1|0|1, sessionType: string, hydrationPlus: number }
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const menstrualCycleEntriesRelations = relations(
  menstrualCycleEntries,
  ({ one }) => ({
    player: one(players, {
      fields: [menstrualCycleEntries.playerId],
      references: [players.id],
    }),
  })
);

// ─── Female Screening ─────────────────────────────────────────────────────────

export const femaleScreenings = pgTable("female_screenings", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  // Blood / Bone markers — SECURITY: Encrypt in production
  ironLevel: real("iron_level"), // µmol/L (normal: 10–30)
  ferritin: real("ferritin"), // µg/L (optimal for athletes: >40)
  boneDensityScore: real("bone_density_score"), // T-score (normal: > -1.0)
  amenorrheaMonths: integer("amenorrhea_months").default(0), // 0 = regular cycle
  energyAvailability: real("energy_availability"), // kcal/kg LBM/day (threshold: <30 = RED-S risk)
  // RED-S Risk Classification
  redSRisk: redSRiskEnum("reds_risk").default("low").notNull(),
  // Alert flag — blocks high-impact training if true
  blockHighImpact: boolean("block_high_impact").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const femaleScreeningsRelations = relations(
  femaleScreenings,
  ({ one }) => ({
    player: one(players, {
      fields: [femaleScreenings.playerId],
      references: [players.id],
    }),
  })
);
