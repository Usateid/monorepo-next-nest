import { cookies } from "next/headers";
import type { UserWithProfile } from "@monorepo/db";

const API_URL = process.env.API_URL || "http://localhost:3001";

export async function getSession(): Promise<UserWithProfile | null> {
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
