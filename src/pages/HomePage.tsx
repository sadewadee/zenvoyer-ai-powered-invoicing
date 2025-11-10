import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from "../lib/auth";
export function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/app/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-foreground">Initializing Zenitho...</div>
      </div>);

  }
  return <Outlet />;
}