"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfile } from "@/app/actions";
import type { UserWithProfile, UpdateProfileData } from "@monorepo/db/types";

interface ProfileFormProps {
  initialUser: UserWithProfile;
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const [user, setUser] = useState<UserWithProfile>(initialUser);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: UpdateProfileData = {
      name: formData.get("name") as string,
      birthDate: (formData.get("birthDate") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      fiscalCode: (formData.get("fiscalCode") as string) || undefined,
    };

    // Rimuovi campi vuoti
    Object.keys(data).forEach((key) => {
      if (data[key as keyof UpdateProfileData] === "") {
        data[key as keyof UpdateProfileData] = undefined;
      }
    });

    try {
      const result = await updateProfile(data);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess(result.message);
      if (result.user) {
        setUser(result.user);
      }
    } catch {
      setError("Errore di connessione al server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-8">
      <header className="flex w-full max-w-4xl items-center justify-between">
        <Link href="/" className="text-2xl font-bold hover:opacity-80">
          🚀 Monorepo
        </Link>
        <span className="text-sm text-muted-foreground">{user.email}</span>
      </header>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Il mio profilo</CardTitle>
          <CardDescription>Modifica i tuoi dati personali</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                L&apos;email non può essere modificata
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                placeholder="Mario Rossi"
                defaultValue={user.profile?.name || ""}
                required
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="birthDate">Data di nascita</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                defaultValue={user.profile?.birthDate || ""}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Indirizzo di residenza</Label>
              <Input
                id="address"
                name="address"
                placeholder="Via Roma 1, 00100 Roma (RM)"
                defaultValue={user.profile?.address || ""}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="fiscalCode">Codice Fiscale</Label>
              <Input
                id="fiscalCode"
                name="fiscalCode"
                placeholder="RSSMRA80A01H501U"
                defaultValue={user.profile?.fiscalCode || ""}
                disabled={loading}
                maxLength={16}
                className="uppercase"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Salvataggio..." : "Salva modifiche"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="ghost" asChild>
            <Link href="/">← Torna alla home</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
