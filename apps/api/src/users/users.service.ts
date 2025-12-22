import { Injectable, NotFoundException } from "@nestjs/common";
import {
  db,
  users,
  userProfiles,
  eq,
  type User,
  type NewUser,
} from "@monorepo/db";
import type { UserWithProfile, UpdateProfileData } from "@monorepo/db/types";
import { UserRole } from "@monorepo/db/types";

@Injectable()
export class UsersService {
  async findAll(): Promise<UserWithProfile[]> {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        profile: {
          name: userProfiles.name,
          birthDate: userProfiles.birthDate,
          address: userProfiles.address,
          fiscalCode: userProfiles.fiscalCode,
        },
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId));

    return result;
  }

  async findOne(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findOneWithProfile(id: string): Promise<UserWithProfile | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;

    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, id));

    return { ...userWithoutPassword, profile: profile || null };
  }

  async updateUserProfile(
    userId: string,
    data: UpdateProfileData & { role?: UserRole }
  ): Promise<UserWithProfile> {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!existingUser) {
      throw new NotFoundException("Utente non trovato");
    }

    // Aggiorna il ruolo se specificato
    let updatedUser = existingUser;
    if (data.role !== undefined && data.role !== existingUser.role) {
      const [user] = await db
        .update(users)
        .set({ role: data.role, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      updatedUser = user;
    }

    const [existingProfile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    const profileData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      profileData.name = data.name;
    }
    if (data.birthDate !== undefined) {
      profileData.birthDate = data.birthDate;
    }
    if (data.address !== undefined) {
      profileData.address = data.address;
    }
    if (data.fiscalCode !== undefined) {
      profileData.fiscalCode = data.fiscalCode;
    }

    let profile;
    if (existingProfile) {
      const [updatedProfile] = await db
        .update(userProfiles)
        .set(profileData)
        .where(eq(userProfiles.userId, userId))
        .returning();
      profile = updatedProfile;
    } else {
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          userId,
          name: data.name || "Utente",
          ...profileData,
        })
        .returning();
      profile = newProfile;
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return { ...userWithoutPassword, profile };
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
}
