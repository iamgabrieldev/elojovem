'use client';

import { useOfflineSync } from '@/lib/offline-sync';
import { useOfflineManager } from '@/lib/offline-manager';

/**
 * Componente que inicializa sincronização offline
 * Deve ser renderizado no root layout
 */
export function OfflineSyncInitializer() {
  useOfflineSync();
  useOfflineManager();
  return null;
}
