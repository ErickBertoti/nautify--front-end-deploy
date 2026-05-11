'use client';

import { useUser } from '@/contexts/UserContext';
import type { UserRole } from '@/types';

export interface BoatPermissions {
  role: UserRole | null;
  isMember: boolean;
  canDeleteBoat: boolean;
  canManagePartners: boolean;
  canViewCashFlow: boolean;
  canViewPartners: boolean;
  canManageFinancials: boolean;
  canDeleteFinancials: boolean;
  canDeleteMaintenance: boolean;
  canRegisterTrip: boolean;
  canRegisterFuel: boolean;
  canRegisterMaintenance: boolean;
  canCreateEvent: boolean;
  canViewDocuments: boolean;
}

export function useBoatPermissions(boatId?: string | null): BoatPermissions {
  const { getRoleForBoat } = useUser();
  const role = boatId ? getRoleForBoat(boatId) : null;

  const isAdmin = role === 'admin';
  const isSocio = role === 'socio';
  const isMember = role !== null;
  const isFinancial = isAdmin || isSocio;

  return {
    role,
    isMember,
    canDeleteBoat: isAdmin,
    canManagePartners: isAdmin,
    canViewCashFlow: isFinancial,
    canViewPartners: isFinancial,
    canManageFinancials: isFinancial,
    canDeleteFinancials: isAdmin,
    canDeleteMaintenance: isAdmin,
    canRegisterTrip: isMember,
    canRegisterFuel: isMember,
    canRegisterMaintenance: isMember,
    canCreateEvent: isMember,
    canViewDocuments: isMember,
  };
}

export function useCanCreateBoat(): boolean {
  const { user } = useUser();
  return !!user;
}

export function useHasAnyFinancialBoat(): boolean {
  const { user } = useUser();
  return user?.memberships?.some(m => m.role === 'admin' || m.role === 'socio') ?? false;
}

export function useHasAnyAdminBoat(): boolean {
  const { user } = useUser();
  return user?.memberships?.some(m => m.role === 'admin') ?? false;
}

export function useHasAnyBoat(): boolean {
  const { user } = useUser();
  return (user?.memberships?.length ?? 0) > 0;
}
