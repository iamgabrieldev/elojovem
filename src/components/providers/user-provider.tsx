'use client';

import { ReactNode, useEffect } from 'react';
import { UserProfile } from '@/lib/types/domain';
import { useUserStore } from '@/store/user-store';

interface UserProviderProps {
  children: ReactNode;
  initialUser?: UserProfile | null;
}

/**
 * Provider que inicializa o Zustand com dados do servidor
 * Permite que componentes filhos usem useUserStore() sem re-fetching
 */
export function UserProvider({ children, initialUser }: UserProviderProps) {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  return <>{children}</>;
}
