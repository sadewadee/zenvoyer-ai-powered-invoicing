import { usePermissions } from "@/hooks/use-permissions";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import { useInvoiceStore } from "@/stores/use-invoice-store";
export function DashboardFactory() {
  const { hasRole, businessStage } = usePermissions();
  const invoices = useInvoiceStore((state) => state.invoices);
  const isNewUser = hasRole('USER') && invoices.length <= 2 && businessStage === 'new';
  if (hasRole('SUPER_ADMIN')) {
    return <SuperAdminDashboard />;
  }
  if (hasRole('ADMIN')) {
    return <AdminDashboard />;
  }
  if (hasRole(['USER', 'SUB_USER'])) {
    return <UserDashboard isNewUser={isNewUser} />;
  }
  return <div>Loading dashboard...</div>;
}