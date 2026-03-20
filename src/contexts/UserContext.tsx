'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService } from '@/services';
import type { User } from '@/types';

interface UserContextValue {
  user: User | null;
  loading: boolean;
  refetch: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refetch: () => {},
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

  return (
    <UserContext.Provider value={{ user, loading, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
