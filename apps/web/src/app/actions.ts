"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL || "http://localhost:3001";

import type { User } from "@/lib/auth";

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
  users: User[];
  success: boolean;
  message: string;
}> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/users`, {
      cache: "no-store",
      headers: authHeaders,
    });

    console.log(res.status);
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

    const data = await res.json();
    return {
      users: data.users,
      success: true,
      message: data.message,
    };
  } catch (error) {
    return {
      users: [],
      success: false,
      message: "Errore durante la ricerca",
    };
  }
}

export interface UpdateProfileData {
  name?: string;
  birthDate?: string;
  address?: string;
  fiscalCode?: string;
}

export async function updateProfile(data: UpdateProfileData): Promise<{
  success: boolean;
  message: string;
  user?: User;
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
