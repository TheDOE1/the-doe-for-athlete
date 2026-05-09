import {
  pgTable,
  uuid,
  date,
  integer,
  real,
  jsonb,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { teams, players } from "./core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const sessionTypeEnum = pgEnum("session_type", [
  "field",
  "gym",
  "match",
  "recovery",
]);

// ─── Training Sessions ───────────────────────────────────────────────────────

export const trainingSessions = pgTable("training_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  type: sessionTypeEnum("type").notNull(),
  date: date("date").notNull(),
  duration: integer("duration").notNull(), // minutes
  rpeAvg: real("rpe_avg"),
  phase: integer("phase"), // microcycle phase
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trainingSessionsRelations = relations(
  trainingSessions,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [trainingSessions.teamId],
      references: [teams.id],
    }),
    loads: many(sessionLoads),
  })
);

// ─── Session Loads (per player) ──────────────────────────────────────────────

export const sessionLoads = pgTable("session_loads", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => trainingSessions.id, { onDelete: "cascade" }),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  rpe: integer("rpe").notNull(), // 1-10
  durationMin: integer("duration_min").notNull(),
  srpe: real("srpe").notNull(), // rpe * duration
  hrData: jsonb("hr_data"), // { avg, max, zones: number[] }
  gpsData: jsonb("gps_data"), // { distance, highSpeed, sprints }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionLoadsRelations = relations(sessionLoads, ({ one }) => ({
  session: one(trainingSessions, {
    fields: [sessionLoads.sessionId],
    references: [trainingSessions.id],
  }),
  player: one(players, {
    fields: [sessionLoads.playerId],
    references: [players.id],
  }),
}));
