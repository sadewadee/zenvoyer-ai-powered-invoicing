import { useLocation } from 'react-router-dom';
const titleMap: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/invoices': 'Invoices',
  '/app/clients': 'Clients',
  '/app/products': 'Products & Services',
  '/app/settings': 'Settings',
  '/admin/super': 'Platform Management',
  '/admin/support': 'Support Dashboard',
};
export function usePageTitle(): string {
  const location = useLocation();
  const { pathname } = location;
  // Handle dynamic invoice detail pages
  if (pathname.startsWith('/app/invoices/')) {
    return 'Invoice Details';
  }
  return titleMap[pathname] || 'Zenitho';
}