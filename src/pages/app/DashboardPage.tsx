import { useAuthStore } from "@/stores/use-auth-store";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import { useInvoiceStore } from "@/stores/use-invoice-store";
import { motion } from "framer-motion";
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const invoices = useInvoiceStore((state) => state.invoices);
  const isNewUser = user?.role === 'USER' && invoices.length <= 2;
  const renderDashboard = () => {
    switch (user?.role) {
      case 'USER':
      case 'SUB_USER':
        return <UserDashboard isNewUser={isNewUser} />;
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
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold">
        Welcome back, {user?.name}!
      </motion.h1>
      {renderDashboard()}
    </div>);
}