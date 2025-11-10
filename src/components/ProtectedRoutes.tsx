import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from "@/stores/use-auth-store";
import { AppLayout } from './layout/AppLayout';
export function ProtectedRoutes() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>);
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.businessStage === 'new' && location.pathname !== '/app/setup') {
    return <Navigate to="/app/setup" replace />;
  }
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>);
}