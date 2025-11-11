import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/use-auth-store';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { generateNavigation } from '@/lib/navigation';
export function Sidebar() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { permissions } = usePermissions();
  const navigationConfig = generateNavigation(user, permissions);
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <aside className={cn(
      "relative hidden h-screen bg-primary-800 text-primary-50 md:flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className={cn("flex items-center h-16 px-6", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <span className="text-2xl font-bold text-white">Zenvoyer</span>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hover:bg-primary-700 text-primary-200 hover:text-white">
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigationConfig.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              {group.title && !isCollapsed && (
                <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-primary-300 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/app/dashboard'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-600 text-white shadow-primary'
                        : 'text-primary-200 hover:bg-primary-700 hover:text-white',
                      isCollapsed && "justify-center"
                    )
                  }
                  title={item.name}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className="px-4 py-4 border-t border-primary-700 space-y-2">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-primary-200 hover:bg-primary-700 hover:text-white transition-colors',
            isCollapsed && "justify-center"
          )}
          title="Logout"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}