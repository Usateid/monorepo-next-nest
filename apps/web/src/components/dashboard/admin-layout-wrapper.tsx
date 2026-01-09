import { AdminNavigation } from "@/components/dashboard/admin-navigation";
import { AdminBottomNav } from "@/components/dashboard/admin-bottom-nav";

export function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <AdminNavigation />
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Bottom Navigation - Mobile */}
      <AdminBottomNav />
    </div>
  );
}
