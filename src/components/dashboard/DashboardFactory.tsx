import { usePermissions } from "@/hooks/use-permissions";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
export function DashboardFactory() {
  const { hasRole, businessStage } = usePermissions();
  if (hasRole('SUPER_ADMIN')) {
    return <SuperAdminDashboard />;
  }
  if (hasRole('ADMIN')) {
    return <AdminDashboard />;
  }
  if (hasRole(['USER', 'SUB_USER'])) {
    return <UserDashboard businessStage={businessStage} />;
  }
  return <div>Loading dashboard...</div>;
}