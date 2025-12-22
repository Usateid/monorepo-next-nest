import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { UserList } from "@/components/user-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteUserForm } from "@/components/invite-user-form";

export default async function UsersPage() {
  const user = await getSession();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestione Utenti</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invita Nuovo Utente</CardTitle>
            <CardDescription>
              Inserisci i dati del nuovo utente. Riceverà un&apos;email di
              invito per verificare il suo account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteUserForm />
          </CardContent>
        </Card>

        <UserList />
      </div>
    </div>
  );
}
