import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

// Lazy initialization — the client is only created on first use,
// not at module load time. This prevents build failures when
// DATABASE_URL is not set during static page generation.
let _db: DB | null = null;

function createDb(): DB {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local or Vercel environment variables."
    );
  }
  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    throw new Error(
      `Invalid DATABASE_URL: "${url.slice(0, 40)}...". Must start with postgresql:// or postgres://`
    );
  }
  const client = postgres(url, {
    max: process.env.NODE_ENV === "production" ? 1 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
    // Required for Neon / pgBouncer — disables prepared statements
    prepare: false,
  });
  return drizzle(client, { schema });
}

export const db = new Proxy({} as DB, {
  get(_, prop: string | symbol) {
    if (!_db) _db = createDb();
    return Reflect.get(_db, prop);
  },
});
