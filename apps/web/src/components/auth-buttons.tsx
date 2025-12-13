"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/auth";

interface AuthButtonsProps {
  user: User | null;
}

export function AuthButtons({ user }: AuthButtonsProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Ciao, <strong>{user.name}</strong>
          {user.role === "admin" && (
            <span className="ml-2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              Admin
            </span>
          )}
        </span>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link href="/login">
        <Button variant="outline">Accedi</Button>
      </Link>
      <Link href="/register">
        <Button>Registrati</Button>
      </Link>
    </div>
  );
}
