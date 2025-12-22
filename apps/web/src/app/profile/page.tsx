import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return <ProfileForm initialUser={user} />;
}
