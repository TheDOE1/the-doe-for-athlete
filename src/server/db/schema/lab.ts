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

export const fvDeficitEnum = pgEnum("fv_deficit", [
  "force",
  "velocity",
  "balanced",
]);

export const exerciseCategoryEnum = pgEnum("exercise_category", [
  "strength",
  "plyometric",
  "speed",
  "agility",
  "prevention",
  "recovery",
]);

export const sportSpecificityEnum = pgEnum("sport_specificity", [
  "low",
  "medium",
  "high",
]);

export const papTargetQualityEnum = pgEnum("pap_target_quality", [
  "power",
  "speed",
  "reactive_strength",
]);

// ─── Force-Velocity Profiles ─────────────────────────────────────────────────

export const forceVelocityProfiles = pgTable("force_velocity_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  f0: real("f0").notNull(),          // N/kg — maximal theoretical force
  v0: real("v0").notNull(),          // m/s  — maximal theoretical velocity
  pmax: real("pmax").notNull(),      // W/kg — maximal power
  sfv: real("sfv").notNull(),        // slope of the F-V relationship (negative)
  drf: real("drf").notNull(),        // decrease in ratio of forces (%)
  optimalLoad: real("optimal_load"), // % body weight
  deficit: fvDeficitEnum("deficit").notNull(),
  rawData: jsonb("raw_data"),        // [{ velocity: number, force: number }]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forceVelocityProfilesRelations = relations(
  forceVelocityProfiles,
  ({ one }) => ({
    player: one(players, {
      fields: [forceVelocityProfiles.playerId],
      references: [players.id],
    }),
  })
);

// ─── Exercise Library ─────────────────────────────────────────────────────────

export const exerciseLibrary = pgTable("exercise_library", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: exerciseCategoryEnum("category").notNull(),
  muscleGroups: text("muscle_groups").array().notNull().default([]),
  equipment: text("equipment").array().notNull().default([]),
  description: text("description").notNull(),
  videoUrl: text("video_url"),
  scienceRationale: text("science_rationale").notNull(),
  difficulty: integer("difficulty").notNull(), // 1-5
  sportSpecificity: sportSpecificityEnum("sport_specificity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── PAP Complexes ────────────────────────────────────────────────────────────

export const papComplexes = pgTable("pap_complexes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  heavyExerciseId: uuid("heavy_exercise_id")
    .notNull()
    .references(() => exerciseLibrary.id, { onDelete: "restrict" }),
  explosiveExerciseId: uuid("explosive_exercise_id")
    .notNull()
    .references(() => exerciseLibrary.id, { onDelete: "restrict" }),
  restSeconds: integer("rest_seconds").notNull(),
  targetQuality: papTargetQualityEnum("target_quality").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const papComplexesRelations = relations(papComplexes, ({ one }) => ({
  heavyExercise: one(exerciseLibrary, {
    fields: [papComplexes.heavyExerciseId],
    references: [exerciseLibrary.id],
    relationName: "heavyExercise",
  }),
  explosiveExercise: one(exerciseLibrary, {
    fields: [papComplexes.explosiveExerciseId],
    references: [exerciseLibrary.id],
    relationName: "explosiveExercise",
  }),
}));
