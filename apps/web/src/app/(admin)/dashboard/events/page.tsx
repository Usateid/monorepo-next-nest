import { AdminSectionHeader } from "@/components/dashboard/admin-section-header";

export default function EventsPage() {
  return (
    <div className="container mx-auto max-w-7xl p-4 pt-16 md:pt-6 md:p-6 lg:p-8">
      <AdminSectionHeader
        title="Gestione Eventi"
        description="Gestisci gli eventi della piattaforma"
      />
    </div>
  );
}
