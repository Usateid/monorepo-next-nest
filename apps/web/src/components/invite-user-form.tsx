"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteUser } from "@/app/actions";
import { UserRole } from "@monorepo/db/types";

export function InviteUserForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const result = await inviteUser({
      firstName,
      lastName,
      email,
      role,
    });

    setIsLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole(UserRole.USER);
    } else {
      setError(result.message);
    }
  };

  const roleLabels: Record<UserRole, string> = {
    [UserRole.USER]: "Utente",
    [UserRole.ADMIN]: "Admin",
    [UserRole.TEACHER]: "Insegnante",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome</Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="Mario"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Cognome</Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder="Rossi"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="mario.rossi@email.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Ruolo</Label>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleziona un ruolo" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UserRole).map((r) => (
              <SelectItem key={r} value={r}>
                {roleLabels[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {success && <p className="text-sm text-green-600">{success}</p>}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Invio in corso..." : "Invita Utente"}
      </Button>
    </form>
  );
}
