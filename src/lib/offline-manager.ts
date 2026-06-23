'use client';

import { useEffect } from 'react';
import { useOfflineStore } from '@/store/offline-store';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Gerenciador de sincronização offline
 * Sincroniza ações queued quando voltaa online
 */
export function useOfflineManager() {
  const { queue, isOnline, isSyncing, setSyncing, removeAction, updateActionStatus } =
    useOfflineStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOnline || isSyncing || queue.length === 0) return;

    const syncQueue = async () => {
      setSyncing(true);

      for (const action of queue) {
        try {
          updateActionStatus(action.id, 'syncing');

          // Executar sync baseado no tipo de ação
          switch (action.type) {
            case 'habit':
              // Implementar sync de hábitos
              console.log('[Offline Sync] Syncing habit:', action.payload);
              break;
            case 'prayer':
              // Implementar sync de orações
              console.log('[Offline Sync] Syncing prayer:', action.payload);
              break;
            case 'reflection':
              // Implementar sync de reflexões
              console.log('[Offline Sync] Syncing reflection:', action.payload);
              break;
            case 'quiz':
              // Implementar sync de quiz
              console.log('[Offline Sync] Syncing quiz:', action.payload);
              break;
          }

          // Remover da queue após sucesso
          removeAction(action.id);

          // Revalidar queries após sync
          queryClient.invalidateQueries();
        } catch (error) {
          console.error('[Offline Sync] Error syncing action:', error);
          updateActionStatus(action.id, 'failed');

          // Retry automático com backoff
          if (action.retries < 3) {
            // Implementar retry com delay exponencial
          }
        }
      }

      setSyncing(false);
    };

    syncQueue();
  }, [isOnline, isSyncing, queue, setSyncing, removeAction, updateActionStatus, queryClient]);
}
