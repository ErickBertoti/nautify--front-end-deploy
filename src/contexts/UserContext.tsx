'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { authService } from '@/services';
import type { User, UserRole } from '@/types';

interface UserContextValue {
  user: User | null;
  loading: boolean;
  refetch: () => void;
  getRoleForBoat: (boatId: string) => UserRole | null;
  hasBoatRole: (boatId: string, roles: UserRole[]) => boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refetch: () => {},
  getRoleForBoat: () => null,
  hasBoatRole: () => false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await authService.me();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const getRoleForBoat = useCallback((boatId: string): UserRole | null => {
    if (!user?.memberships) return null;
    const membership = user.memberships.find(m => m.boatId === boatId);
    return membership?.role ?? null;
  }, [user]);

  const hasBoatRole = useCallback((boatId: string, roles: UserRole[]): boolean => {
    const role = getRoleForBoat(boatId);
    return role !== null && roles.includes(role);
  }, [getRoleForBoat]);

  const value = useMemo(() => ({
    user, loading, refetch: fetchUser, getRoleForBoat, hasBoatRole,
  }), [user, loading, fetchUser, getRoleForBoat, hasBoatRole]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
