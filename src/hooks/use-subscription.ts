import { useAuthStore } from '@/stores/use-auth-store';
import { useUserManagementStore } from '@/stores/use-user-management-store';
export function useSubscription() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const users = useUserManagementStore((state) => state.users);
  const currentUser = users.find((u) => u.id === currentUserId);
  const plan = currentUser?.plan || 'Free';
  const isPro = plan === 'Pro';
  return { plan, isPro };
}