import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUser } from "@/app/actions";
import { EditUserForm } from "./edit-user-form";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;
  const { user, success, message } = await getUser(id);

  if (!success || !user) {
    notFound();
  }

  return <EditUserForm initialUser={user} />;
}
