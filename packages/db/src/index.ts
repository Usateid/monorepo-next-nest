// Database client
export { db, closeDb } from "./client";

// Schema and types
export * from "./schema";

// Re-export useful drizzle utilities
export {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  like,
  ilike,
  and,
  or,
  not,
  inArray,
  notInArray,
  isNull,
  isNotNull,
  asc,
  desc,
  sql,
} from "drizzle-orm";
