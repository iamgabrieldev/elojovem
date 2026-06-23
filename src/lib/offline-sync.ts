'use client';

import { useEffect } from 'react';
import { useOfflineStore } from '@/store/offline-store';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook que sincroniza status de connectividade com Zustand
 * Também revalida queries quando volta online
 */
export function useOfflineSync() {
  const { setOnline } = useOfflineStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Online');
      setOnline(true);
      
      // Revalidar todas as queries quando volta online
      queryClient.refetchQueries();
    };

    const handleOffline = () => {
      console.log('🔴 Offline');
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sincronizar estado inicial
    if (navigator.onLine) {
      setOnline(true);
    } else {
      setOnline(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, queryClient]);
}
