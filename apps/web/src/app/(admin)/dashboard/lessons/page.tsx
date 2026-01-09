import { AdminSectionHeader } from "@/components/dashboard/admin-section-header";

export default function LessonsPage() {
  return (
    <div className="container mx-auto max-w-7xl p-4 pt-16 md:pt-6 md:p-6 lg:p-8">
      <AdminSectionHeader
        title="Gestione Lezioni"
        description="Gestisci le lezioni della piattaforma"
      />
    </div>
  );
}
