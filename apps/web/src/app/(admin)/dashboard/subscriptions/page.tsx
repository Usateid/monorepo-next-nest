import { AdminSectionHeader } from "@/components/dashboard/admin-section-header";

export default function SubscriptionsPage() {
  return (
    <div className="container mx-auto max-w-7xl p-4 pt-16 md:pt-6 md:p-6 lg:p-8">
      <AdminSectionHeader
        title="Gestione Abbonamenti"
        description="Gestisci gli abbonamenti della piattaforma"
      />
    </div>
  );
}
