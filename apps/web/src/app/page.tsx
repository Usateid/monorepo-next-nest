import { Suspense } from "react";
// import { UserForm } from "@/components/user-form";
import { UserList } from "@/components/user-list";
import { AuthButtons } from "@/components/auth-buttons";
import { getSession } from "@/lib/auth";
import { UserRole } from "@monorepo/db/types";

export default async function Home() {
  const user = await getSession();

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-8">
      <header className="flex w-full max-w-4xl items-center justify-between">
        <h1 className="text-2xl font-bold">🚀 Monorepo</h1>
        <AuthButtons user={user} />
      </header>

      <div className="text-center"></div>

      {user ? (
        <div className="flex flex-col items-center gap-6">
          {/* <UserForm /> */}
          <Suspense
            fallback={
              <div className="w-full max-w-md rounded-lg border p-6">
                Caricamento...
              </div>
            }
          >
            {user.role === UserRole.ADMIN && <UserList />}
          </Suspense>
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          <p>Effettua il login per vedere e gestire gli utenti</p>
        </div>
      )}
    </main>
  );
}
