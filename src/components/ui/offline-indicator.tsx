'use client';

import { useEffect, useState } from 'react';
import { useOfflineStore } from '@/store/offline-store';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * Indicador visual de status offline/online
 * Aparece no topo quando offline ou syncing
 */
export function OfflineIndicator() {
  const { isOnline, isSyncing, queue } = useOfflineStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Não mostra se online e não syncing
  if (isOnline && !isSyncing) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
        isOnline && isSyncing
          ? 'bg-blue-100 text-blue-900'
          : 'bg-amber-100 text-amber-900'
      }`}
    >
      {isSyncing ? (
        <>
          <Wifi className="h-4 w-4 animate-pulse" />
          <span>
            Sincronizando {queue.length} ação{queue.length !== 1 ? 's' : ''}...
          </span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>
            Offline — {queue.length} ação{queue.length !== 1 ? 's' : ''} em
            fila
          </span>
        </>
      )}
    </div>
  );
}
