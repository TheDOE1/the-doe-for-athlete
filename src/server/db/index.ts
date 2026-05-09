import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local or Vercel environment variables."
  );
}

// prepare:false is required for Neon / pgBouncer (transaction mode poolers)
const client = postgres(url, {
  max: process.env.NODE_ENV === "production" ? 1 : 5,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, { schema });
