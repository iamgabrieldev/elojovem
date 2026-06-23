import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OfflineAction {
  id: string;
  type: 'habit' | 'prayer' | 'reflection' | 'quiz';
  payload: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  retries: number;
}

interface OfflineStore {
  queue: OfflineAction[];
  isOnline: boolean;
  isSyncing: boolean;
  addAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'status' | 'retries'>) => void;
  removeAction: (id: string) => void;
  updateActionStatus: (id: string, status: OfflineAction['status']) => void;
  incrementRetries: (id: string) => void;
  clearQueue: () => void;
  setOnline: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set) => ({
      queue: [],
      isOnline: typeof window !== 'undefined' && navigator.onLine,
      isSyncing: false,

      addAction: (action) => {
        set((state) => ({
          queue: [
            ...state.queue,
            {
              ...action,
              id: `${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
              status: 'pending' as const,
              retries: 0,
            },
          ],
        }));
      },

      removeAction: (id) => {
        set((state) => ({
          queue: state.queue.filter((a) => a.id !== id),
        }));
      },

      updateActionStatus: (id, status) => {
        set((state) => ({
          queue: state.queue.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        }));
      },

      incrementRetries: (id) => {
        set((state) => ({
          queue: state.queue.map((a) =>
            a.id === id ? { ...a, retries: a.retries + 1 } : a
          ),
        }));
      },

      clearQueue: () => {
        set({ queue: [] });
      },

      setOnline: (isOnline) => {
        set({ isOnline });
      },

      setSyncing: (isSyncing) => {
        set({ isSyncing });
      },
    }),
    {
      name: 'offline-store',
      version: 1,
    }
  )
);
