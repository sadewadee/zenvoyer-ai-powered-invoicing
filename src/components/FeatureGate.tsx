import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { useSubscription } from '@/hooks/use-subscription';
import type { UserRole, Permission } from '@/types';
interface FeatureGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPlan?: 'Free' | 'Pro';
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: Permission | Permission[];
  businessStage?: 'new' | 'intermediate' | 'advanced';
}
export function FeatureGate({
  children,
  fallback = null,
  requiredPlan,
  requiredRole,
  requiredPermission,
  businessStage,
}: FeatureGateProps) {
  const { plan } = useSubscription();
  const { hasRole, can, businessStage: userStage } = usePermissions();
  const planCheck = requiredPlan ? plan === requiredPlan : true;
  const roleCheck = requiredRole ? hasRole(requiredRole) : true;
  const permissionCheck = requiredPermission ? can(requiredPermission) : true;
  const stageCheck = businessStage ? userStage === businessStage : true;
  if (planCheck && roleCheck && permissionCheck && stageCheck) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}