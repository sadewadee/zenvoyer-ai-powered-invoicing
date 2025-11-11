import { useAuthStore } from "@/stores/use-auth-store";
import { motion } from "framer-motion";
import { DashboardFactory } from "@/components/dashboard/DashboardFactory";
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold">
        Welcome back, {user?.name}!
      </motion.h1>
      <DashboardFactory />
    </div>);
}