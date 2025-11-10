import { useAuthStore } from "@/hooks/use-auth-store";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
export function DashboardPage() {
  const user = useAuthStore(state => state.user);
  const renderDashboard = () => {
    switch (user?.role) {
      case 'USER':
      case 'SUB_USER':
        return <UserDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />;
      default:
        return <div>Loading dashboard...</div>;
    }
  };
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
      {renderDashboard()}
    </div>
  );
}