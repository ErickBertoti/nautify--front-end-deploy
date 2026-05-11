'use client';

import type { ReactNode } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { UserRole } from '@/types';

interface RoleGateProps {
  boatId: string;
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ boatId, allowedRoles, children, fallback = null }: RoleGateProps) {
  const { hasBoatRole, loading } = useUser();

  if (loading) return null;

  if (!hasBoatRole(boatId, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
