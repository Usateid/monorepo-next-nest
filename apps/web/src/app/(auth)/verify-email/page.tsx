"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token mancante");
      return;
    }

    async function verifyEmail() {
      try {
        const res = await fetch("http://localhost:3001/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || "Errore durante la verifica");
          return;
        }

        setStatus("success");
        setMessage(data.message);
      } catch {
        setStatus("error");
        setMessage("Errore di connessione al server");
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {status === "loading" && "⏳ Verifica in corso..."}
          {status === "success" && "✅ Email verificata!"}
          {status === "error" && "❌ Errore"}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {status !== "loading" && (
        <CardFooter className="justify-center">
          <Link href="/login">
            <Button>Vai al login</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
