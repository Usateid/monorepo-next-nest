import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Create singletons with lazy initialization
let pool: Pool | null = null;
let drizzleClient: NodePgDatabase<typeof schema> | null = null;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    pool = new Pool({ connectionString });
  }
  return pool;
}

// Lazy getter for the drizzle client
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    if (!drizzleClient) {
      drizzleClient = drizzle(getPool(), { schema });
    }
    return (drizzleClient as any)[prop];
  },
});

// Export a function to close the pool (useful for graceful shutdown)
export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    drizzleClient = null;
  }
}
