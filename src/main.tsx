import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
// Layouts and Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ProtectedRoutes } from '@/components/ProtectedRoutes';
import { DashboardPage } from '@/pages/app/DashboardPage';
import { InvoicesPage } from '@/pages/app/InvoicesPage';
import { ClientsPage } from '@/pages/app/ClientsPage';
import { ProductsPage } from '@/pages/app/ProductsPage';
import { SettingsPage } from '@/pages/app/SettingsPage';
import { SuperAdminPage } from '@/pages/admin/SuperAdminPage';
import { SupportPage } from '@/pages/admin/SupportPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: "/app/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/app/invoices",
        element: <InvoicesPage />,
      },
      {
        path: "/app/clients",
        element: <ClientsPage />,
      },
      {
        path: "/app/products",
        element: <ProductsPage />,
      },
      {
        path: "/app/settings",
        element: <SettingsPage />,
      },
      {
        path: "/admin/super",
        element: <SuperAdminPage />,
      },
      {
        path: "/admin/support",
        element: <SupportPage />,
      },
    ],
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);