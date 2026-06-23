import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/firestore/repos';
import { UserProfile } from '@/lib/types/domain';
import { useUserStore } from '@/store/user-store';

export const userQueryKeys = {
  all: ['user'] as const,
  detail: (id: string) => [...userQueryKeys.all, 'detail', id] as const,
};

/**
 * Query definition para getUserProfile
 * Configurado com staleTime de 5 minutos
 */
export function useUserQuery(
  userId: string | undefined,
  options?: Omit<
    UseQueryOptions<UserProfile | null, Error, UserProfile | null>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: userQueryKeys.detail(userId || 'unknown'),
    queryFn: async () => {
      if (!userId) throw new Error('userId is required');
      return getUserProfile(userId);
    },
    enabled: !!userId, // Só faz query se tiver userId
    staleTime: 1000 * 60 * 5, // 5 minutos
    ...options,
  });
}

/**
 * Hook customizado que:
 * 1. Verifica se tem no Zustand (persistido)
 * 2. Se não, faz query via React Query
 * 3. Sincroniza resultado de volta ao Zustand
 */
export function useUser(userId: string | undefined) {
  const { user, setUser, isLoading, setLoading, error } = useUserStore();
  const query = useUserQuery(userId);

  // Sincroniza resultado da query ao Zustand
  if (query.data && !user?.id) {
    setUser(query.data);
  }

  // Sincroniza loading state
  if (query.isLoading !== isLoading) {
    setLoading(query.isLoading);
  }

  // Retorna dados com preferência para Zustand (já em memória)
  return {
    user: user || query.data,
    isLoading: query.isLoading,
    error: query.error || error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

/**
 * Hook para invalidar user query (usado após mutations)
 * Ex: após atualizar profil, fazer logout, etc.
 */
export function useInvalidateUserQuery() {
  const clearUser = useUserStore((state) => state.clearUser);

  return {
    clearUser,
  };
}
