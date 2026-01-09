import { AdminSectionHeader } from "@/components/dashboard/admin-section-header";
import { AdminSectionContent } from "@/components/dashboard/empty-section";
export default function UsersPage() {
  const currentSection = {
    title: "Gestione Utenti",
    description: "Gestisci gli utenti della piattaforma",
  };
  return (
    <div className="container mx-auto max-w-7xl p-4 pt-16 md:pt-6 md:p-6 lg:p-8">
      <AdminSectionHeader
        title={currentSection.title}
        description={currentSection.description}
      />
      <AdminSectionContent section="users" />
    </div>
  );
}
