'use client';

import { useUser } from '@/contexts/UserContext';

/**
 * Returns true if the user has admin or socio role on at least one boat.
 * Marinheiro-only users get false (read-only mode).
 */
export function useCanWrite(): boolean {
  const { user } = useUser();
  return user?.memberships?.some(m => m.role === 'admin' || m.role === 'socio') ?? false;
}
