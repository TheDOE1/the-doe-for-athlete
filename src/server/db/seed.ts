// ─────────────────────────────────────────────────────────────────────────────
// Seed Script — Populates the database with demo data
// Usage: pnpm db:seed
//
// Creates:
//   - 1 organisation (The Doe FC)
//   - 2 users: admin + coach (passwords hashed with bcrypt)
//   - 1 équipe (Paris FC Elite)
//   - 16 joueurs (mix hommes/femmes, tous les postes)
//   - Sessions d'entraînement + charge ACWR
//   - Données wellness de démo
// ─────────────────────────────────────────────────────────────────────────────

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import {
  organizations,
  users,
  teams,
  players,
  trainingSessions,
  sessionLoads,
  wellnessEntries,
} from "./schema";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  console.log("🌱 Seeding database...");

  // ── 1. Organisation ────────────────────────────────────────────────────────
  console.log("  → Creating organisation...");
  const [org] = await db
    .insert(organizations)
    .values({
      name: "The Doe FC",
      plan: "pro",
    })
    .returning();

  if (!org) throw new Error("Failed to create organisation");

  // ── 2. Users ───────────────────────────────────────────────────────────────
  console.log("  → Creating users...");
  const SALT_ROUNDS = 12;

  const [adminUser] = await db
    .insert(users)
    .values({
      name: "Admin The Doe",
      email: "admin@thedoefc.com",
      passwordHash: await bcrypt.hash("Admin123!", SALT_ROUNDS),
      role: "admin",
      organizationId: org.id,
    })
    .returning();

  const [coachUser] = await db
    .insert(users)
    .values({
      name: "Thomas Préparateur",
      email: "coach@thedoefc.com",
      passwordHash: await bcrypt.hash("Coach123!", SALT_ROUNDS),
      role: "head_coach",
      organizationId: org.id,
    })
    .returning();

  const [physioUser] = await db
    .insert(users)
    .values({
      name: "Sarah Kinésithérapeute",
      email: "physio@thedoefc.com",
      passwordHash: await bcrypt.hash("Physio123!", SALT_ROUNDS),
      role: "physio",
      organizationId: org.id,
    })
    .returning();

  console.log("  ✓ Users created:");
  console.log("    admin@thedoefc.com / Admin123!");
  console.log("    coach@thedoefc.com / Coach123!");
  console.log("    physio@thedoefc.com / Physio123!");

  if (!adminUser || !coachUser || !physioUser) {
    throw new Error("Failed to create users");
  }

  // ── 3. Team ────────────────────────────────────────────────────────────────
  console.log("  → Creating team...");
  const [team] = await db
    .insert(teams)
    .values({
      name: "Paris FC Elite",
      sport: "football",
      season: "2024-2025",
      organizationId: org.id,
    })
    .returning();

  if (!team) throw new Error("Failed to create team");

  // ── 4. Players ─────────────────────────────────────────────────────────────
  console.log("  → Creating players...");

  const playersData = [
    // Gardiens
    { firstName: "Lucas", lastName: "Fernandez", position: "GK", sex: "male", height: "188", weight: "82" },
    // Défenseurs
    { firstName: "Théo", lastName: "Dubois", position: "CB", sex: "male", height: "185", weight: "79" },
    { firstName: "Antoine", lastName: "Mercier", position: "CB", sex: "male", height: "183", weight: "77" },
    { firstName: "Mathis", lastName: "Laurent", position: "LB", sex: "male", height: "178", weight: "73" },
    { firstName: "Romain", lastName: "Petit", position: "RB", sex: "male", height: "179", weight: "74" },
    // Milieux
    { firstName: "Karim", lastName: "Benali", position: "CDM", sex: "male", height: "181", weight: "76" },
    { firstName: "Hugo", lastName: "Rousseau", position: "CM", sex: "male", height: "180", weight: "75" },
    { firstName: "Alexandre", lastName: "Girard", position: "CAM", sex: "male", height: "177", weight: "72" },
    // Ailiers / Attaquants
    { firstName: "Dylan", lastName: "Moreau", position: "LW", sex: "male", height: "175", weight: "70" },
    { firstName: "Nathan", lastName: "Simon", position: "RW", sex: "male", height: "176", weight: "71" },
    { firstName: "Enzo", lastName: "Blanc", position: "ST", sex: "male", height: "182", weight: "78" },
    // Joueuses (équipe féminine dans la même org pour démo)
    { firstName: "Amandine", lastName: "Henry", position: "MIL", sex: "female", height: "168", weight: "62" },
    { firstName: "Marie", lastName: "Katoto", position: "ATT", sex: "female", height: "165", weight: "59" },
    { firstName: "Griedge", lastName: "Mbock", position: "DEF", sex: "female", height: "170", weight: "64" },
    { firstName: "Wendie", lastName: "Renard", position: "DEF", sex: "female", height: "179", weight: "71" },
    { firstName: "Selma", lastName: "Bacha", position: "MIL", sex: "female", height: "163", weight: "57" },
  ];

  const insertedPlayers = await db
    .insert(players)
    .values(
      playersData.map((p) => ({
        ...p,
        teamId: team.id,
        birthDate: new Date("1998-06-15"),
      }))
    )
    .returning();

  console.log(`  ✓ ${insertedPlayers.length} players created`);

  // ── 5. Training Sessions + Loads ───────────────────────────────────────────
  console.log("  → Creating training sessions and loads...");

  const today = new Date();
  const sessionsData = [];

  // Generate 28 days of sessions (Mon-Fri, 4 sessions/week)
  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (4 - week) * 7);

    // Match day (Saturday)
    const matchDay = new Date(weekStart);
    matchDay.setDate(weekStart.getDate() + 5);
    sessionsData.push({
      teamId: team.id,
      date: matchDay.toISOString().split("T")[0]!,
      type: "match" as const,
      duration: 90,
    });

    // Monday recovery
    const mon = new Date(weekStart);
    sessionsData.push({
      teamId: team.id,
      date: mon.toISOString().split("T")[0]!,
      type: "recovery" as const,
      duration: 40,
    });

    // Tuesday — field
    const tue = new Date(weekStart);
    tue.setDate(weekStart.getDate() + 1);
    sessionsData.push({
      teamId: team.id,
      date: tue.toISOString().split("T")[0]!,
      type: "field" as const,
      duration: 75,
    });

    // Wednesday — gym
    const wed = new Date(weekStart);
    wed.setDate(weekStart.getDate() + 2);
    sessionsData.push({
      teamId: team.id,
      date: wed.toISOString().split("T")[0]!,
      type: "gym" as const,
      duration: 70,
    });

    // Thursday — field
    const thu = new Date(weekStart);
    thu.setDate(weekStart.getDate() + 3);
    sessionsData.push({
      teamId: team.id,
      date: thu.toISOString().split("T")[0]!,
      type: "field" as const,
      duration: 80,
    });

    // Friday — field (activation)
    const fri = new Date(weekStart);
    fri.setDate(weekStart.getDate() + 4);
    sessionsData.push({
      teamId: team.id,
      date: fri.toISOString().split("T")[0]!,
      type: "field" as const,
      duration: 45,
    });
  }

  const insertedSessions = await db
    .insert(trainingSessions)
    .values(sessionsData)
    .returning();

  // Session loads for first 5 players
  const loadsData = [];
  for (const session of insertedSessions.slice(0, 12)) {
    for (const player of insertedPlayers.slice(0, 5)) {
      const baseRpe = session.type === "match" ? 8 : session.type === "gym" ? 7 : 6;
      const rpe = Math.max(1, Math.min(10, baseRpe + Math.floor(Math.random() * 3) - 1));
      const durationMin = session.duration ?? 60;
      const srpe = rpe * durationMin;
      loadsData.push({
        playerId: player.id,
        sessionId: session.id,
        rpe,
        durationMin,
        srpe,
        hrData: {
          avg: 140 + Math.floor(Math.random() * 25),
          max: 175 + Math.floor(Math.random() * 15),
          zones: [5, 10, 25, 35, 25],
        },
        gpsData: {
          distance: session.type === "match" ? 10500 + Math.floor(Math.random() * 1500) : 5000 + Math.floor(Math.random() * 3000),
          highSpeed: Math.floor(Math.random() * 800) + 200,
          sprints: session.type === "match" ? 28 + Math.floor(Math.random() * 12) : 10 + Math.floor(Math.random() * 15),
        },
      });
    }
  }

  await db.insert(sessionLoads).values(loadsData);
  console.log(`  ✓ ${insertedSessions.length} sessions + ${loadsData.length} loads created`);

  // ── 6. Wellness entries ────────────────────────────────────────────────────
  console.log("  → Creating wellness entries...");

  const wellnessData = [];
  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split("T")[0]!;

    for (const player of insertedPlayers.slice(0, 4)) {
      wellnessData.push({
        playerId: player.id,
        date: dateStr,
        fatigue: Math.ceil(Math.random() * 4) + 1,
        soreness: Math.ceil(Math.random() * 4) + 1,
        sleep: Math.ceil(Math.random() * 3) + 2,
        mood: Math.ceil(Math.random() * 3) + 2,
        stress: Math.ceil(Math.random() * 3) + 1,
        hrv: Math.floor(Math.random() * 30) + 55,
      });
    }
  }

  await db.insert(wellnessEntries).values(wellnessData);
  console.log(`  ✓ ${wellnessData.length} wellness entries created`);

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin  : admin@thedoefc.com / Admin123!");
  console.log("   Coach  : coach@thedoefc.com / Coach123!");
  console.log("   Physio : physio@thedoefc.com / Physio123!");

  await client.end();
}

void seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
