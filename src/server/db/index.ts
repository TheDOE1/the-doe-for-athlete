import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check your .env.local file.");
}

const connectionString = process.env.DATABASE_URL;

// In serverless (Vercel), use max:1 to avoid exhausting DB connections.
// For local dev, allow a small pool for better perf.
const client = postgres(connectionString, {
  max: process.env.NODE_ENV === "production" ? 1 : 5,
  idle_timeout: 20,
  connect_timeout: 10,
  // Required for PgBouncer (Neon, Supabase pooler) — disables prepared statements
  prepare: false,
});

export const db = drizzle(client, { schema });
