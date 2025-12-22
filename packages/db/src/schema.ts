import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Importa UserRole da types.ts (unica fonte di verità)
import { UserRole } from "./types";

// Postgres enum (automaticamente sincronizzato con UserRole)
export const roleEnum = pgEnum(
  "role",
  Object.values(UserRole) as [string, ...string[]]
);

// Users table - Solo dati di autenticazione
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default(UserRole.USER).notNull().$type<UserRole>(),

  // Email verification
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),

  // Password reset
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),

  // Remember me / Refresh token
  refreshToken: text("refresh_token"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User profiles table - Dati anagrafici
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // Dati personali
  name: text("name").notNull(),
  birthDate: date("birth_date"),
  address: text("address"),
  fiscalCode: text("fiscal_code"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

// Inferred types (Drizzle-specific, for server-side use)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

// Re-export client-safe types from types.ts
// This allows importing everything from @monorepo/db on server-side
export {
  UserRole,
  UpdateProfileData,
  UserProfileData,
  UserWithProfile,
} from "./types";
