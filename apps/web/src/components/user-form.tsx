"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser } from "@/app/actions";

export function UserForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      return createUser(formData);
    },
    null
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Aggiungi Utente</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              placeholder="Mario Rossi"
              required
              disabled={isPending}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="mario@example.com"
              required
              disabled={isPending}
            />
          </div>
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600">
              Utente creato con successo!
            </p>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creazione..." : "Crea Utente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
