import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/hooks/use-auth-store';
import { AppLayout } from './layout/AppLayout';
export function ProtectedRoutes() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}