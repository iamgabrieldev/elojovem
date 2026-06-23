'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { OfflineSyncInitializer } from '@/components/ui/offline-sync-initializer';
import { OfflineIndicator } from '@/components/ui/offline-indicator';

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineSyncInitializer />
      <OfflineIndicator />
      {children}
    </QueryClientProvider>
  );
}
