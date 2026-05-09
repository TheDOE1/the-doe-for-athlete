// ─────────────────────────────────────────────────────────────────────────────
// Migration Runner — runs all pending Drizzle migrations
// Usage: pnpm db:migrate
// ─────────────────────────────────────────────────────────────────────────────

import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as path from "path";

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  console.log("🔄 Running migrations...");

  // Use a single connection for migrations (not pooled)
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "src/server/db/migrations"),
    });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

void runMigrations();
