import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, Package, Settings, Shield, LifeBuoy, LogOut, ChevronsLeft, ChevronsRight, BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/use-auth-store';
import { cn } from '@/lib/utils';
import { useState } from 'react';
const userNav = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/app/invoices', icon: FileText },
  { name: 'Clients', href: '/app/clients', icon: Users },
  { name: 'Products', href: '/app/products', icon: Package },
  { name: 'Reports', href: '/app/reports', icon: BarChart2 },
];
const adminNav = [
  { name: 'Support Dashboard', href: '/admin/support', icon: LifeBuoy },
];
const superAdminNav = [
  { name: 'Platform Stats', href: '/admin/super', icon: Shield },
];
const bottomNav = [
  { name: 'Settings', href: '/app/settings', icon: Settings },
];
export function Sidebar() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const getNavItems = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return [...userNav, ...adminNav, ...superAdminNav];
      case 'ADMIN':
        return [...userNav, ...adminNav];
      case 'USER':
      case 'SUB_USER':
        return userNav;
      default:
        return [];
    }
  };
  const navItems = getNavItems();
  return (
    <aside className={cn(
      "relative hidden h-screen bg-primary-800 text-primary-50 md:flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className={cn("flex items-center h-16 px-6", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <span className="text-2xl font-bold text-white">Zenitho</span>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hover:bg-primary-700 text-primary-200 hover:text-white">
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white shadow-primary'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white',
                  isCollapsed && "justify-center"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="px-4 py-4 border-t border-primary-700 space-y-2">
        {bottomNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-primary-200 hover:bg-primary-700 hover:text-white',
                isCollapsed && "justify-center"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-primary-200 hover:bg-primary-700 hover:text-white transition-colors',
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}