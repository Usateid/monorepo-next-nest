import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:3001";

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  birthDate: string | null;
  address: string | null;
  fiscalCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  emailVerified: boolean;
  createdAt: string;
  profile: UserProfile | null;
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return null;
    }

    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}
