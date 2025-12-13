"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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

export async function getUsers() {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/users`, {
      cache: "no-store",
      headers: authHeaders,
    });

    if (!res.ok) {
      return [];
    }

    return res.json();
  } catch (error) {
    return [];
  }
}
