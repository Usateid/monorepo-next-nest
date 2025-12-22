"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { UpdateProfileData } from "@monorepo/db";
import { type UserWithProfile, UserRole } from "@monorepo/db/types";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (accessToken) {
    return { Cookie: `access_token=${accessToken}` };
  }
  return {};
}

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { error: "Nome ed email sono obbligatori" };
  }

  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ name, email }),
    });

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || "Errore durante la creazione" };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Errore di connessione al server" };
  }
}

export async function getUsers(): Promise<{
  users: UserWithProfile[];
  success: boolean;
  message?: string;
}> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/users`, {
      cache: "no-store",
      headers: authHeaders,
    });

    if (!res.ok) {
      if (res.status === 403) {
        return {
          users: [],
          success: false,
          message: "Non hai i permessi per vedere gli utenti",
        };
      }
      return {
        users: [],
        success: false,
        message: "Errore durante la ricerca",
      };
    }

    const data: UserWithProfile[] = await res.json();

    return {
      users: data,
      success: true,
    };
  } catch (error) {
    return {
      users: [],
      success: false,
      message: "Errore durante la ricerca",
    };
  }
}

export async function updateProfile(data: UpdateProfileData): Promise<{
  success: boolean;
  message: string;
  user?: UserWithProfile;
}> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: responseData.message || "Errore durante l'aggiornamento",
      };
    }

    revalidatePath("/profile");
    return {
      success: true,
      message: responseData.message,
      user: responseData.user,
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore di connessione al server",
    };
  }
}

export async function getUser(userId: string): Promise<{
  user: UserWithProfile | null;
  success: boolean;
  message?: string;
}> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      cache: "no-store",
      headers: authHeaders,
    });

    if (!res.ok) {
      if (res.status === 403) {
        return {
          user: null,
          success: false,
          message: "Non hai i permessi per vedere questo utente",
        };
      }
      if (res.status === 404) {
        return {
          user: null,
          success: false,
          message: "Utente non trovato",
        };
      }
      return {
        user: null,
        success: false,
        message: "Errore durante la ricerca",
      };
    }

    const data: UserWithProfile = await res.json();
    return {
      user: data,
      success: true,
    };
  } catch (error) {
    return {
      user: null,
      success: false,
      message: "Errore di connessione al server",
    };
  }
}

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileData & { role?: UserRole }
): Promise<{
  success: boolean;
  message: string;
  user?: UserWithProfile;
}> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/users/${userId}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: responseData.message || "Errore durante l'aggiornamento",
      };
    }

    revalidatePath(`/users/${userId}`);
    revalidatePath("/");
    return {
      success: true,
      message: responseData.message,
      user: responseData.user,
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore di connessione al server",
    };
  }
}

export async function inviteUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}): Promise<{
  success: boolean;
  message: string;
  user?: UserWithProfile;
}> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/users/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: responseData.message || "Errore durante l'invito",
      };
    }

    revalidatePath("/users");
    revalidatePath("/");
    return {
      success: true,
      message: responseData.message,
      user: responseData.user,
    };
  } catch (error) {
    return {
      success: false,
      message: "Errore di connessione al server",
    };
  }
}
