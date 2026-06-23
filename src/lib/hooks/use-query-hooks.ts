'use client';

import {
  useQuery,
  useMutation,
  useQueries,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { useCacheStore } from '@/store/cache-store';
import { useOfflineStore } from '@/store/offline-store';

/**
 * Wrapper customizado de useQuery com suporte a cache local
 * Prioriza: Offline Cache → React Query Cache → Network
 */
export function useQueryWithLocalCache<
  TData = unknown,
  TError = Error,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(
  options: UseQueryOptions<TData, TError, TData, TQueryKey> & {
    cacheKey?: string;
    cacheTtl?: number;
  }
) {
  const { cacheKey, cacheTtl } = options;
  const cacheStore = useCacheStore();
  const isOnline = useOfflineStore((state) => state.isOnline);

  // Se está offline e tem cache local, usa
  if (!isOnline && cacheKey) {
    const cachedData = cacheStore.get(cacheKey) as TData | null;
    if (cachedData) {
      return {
        data: cachedData,
        isLoading: false,
        isError: false,
        error: null,
        isFetching: false,
      };
    }
  }

  const query = useQuery(options);

  // Salva em cache local quando sucesso
  if (query.isSuccess && query.data && cacheKey) {
    cacheStore.set(cacheKey, query.data, cacheTtl);
  }

  return query;
}

/**
 * Wrapper customizado de useMutation com suporte a offline queue
 * Se offline, adiciona à queue; se online, executa imediatamente
 */
export function useMutationWithOfflineSupport<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    actionType?: 'habit' | 'prayer' | 'reflection' | 'quiz';
    onlineMutationFn?: (variables: TVariables) => Promise<TData>;
  }
) {
  const { actionType, onlineMutationFn } = options;
  const isOnline = useOfflineStore((state) => state.isOnline);
  const addOfflineAction = useOfflineStore((state) => state.addAction);

  return useMutation({
    ...options,
    mutationFn: async (variables: TVariables) => {
      if (!isOnline && actionType) {
        // Offline: queue a ação
        addOfflineAction({
          type: actionType,
          payload: variables as Record<string, unknown>,
        });
        return variables as unknown as TData;
      }

      // Online: executa a função customizada
      if (onlineMutationFn) {
        return onlineMutationFn(variables);
      }

      throw new Error('onlineMutationFn is required for online mutations');
    },
  });
}

/**
 * Wrapper para múltiplas queries paralelas com tratamento de erro
 */
export function useQueriesWithErrorHandling<T extends readonly any[]>(
  options: Array<any>
) {
  return useQueries({
    queries: options,
    combine: (results) => ({
      data: results.map((r) => r.data),
      isPending: results.some((r) => r.isPending),
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
      errors: results
        .filter((r) => r.error)
        .map((r) => r.error),
    }),
  });
}
