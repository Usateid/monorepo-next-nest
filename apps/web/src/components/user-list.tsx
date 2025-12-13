import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsers } from "@/app/actions";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export async function UserList() {
  const users: User[] = await getUsers();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Utenti ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nessun utente presente
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-col gap-1 rounded-lg border p-3"
              >
                <span className="font-medium">{user.name}</span>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
