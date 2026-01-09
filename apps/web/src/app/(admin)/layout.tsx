import { AdminLayoutWrapper } from "@/components/dashboard/admin-layout-wrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
