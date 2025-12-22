// Client-safe types - no Node.js dependencies
// These can be safely imported in "use client" components

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

// DTO types
export interface UpdateProfileData {
  name?: string;
  birthDate?: string;
  address?: string;
  fiscalCode?: string;
}

// User profile type (standalone, no drizzle dependency)
export interface UserProfileData {
  id?: string;
  userId?: string;
  name: string;
  birthDate: string | null;
  address: string | null;
  fiscalCode: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// User with profile type for client components
export interface UserWithProfile {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: UserProfileData | null;
}
