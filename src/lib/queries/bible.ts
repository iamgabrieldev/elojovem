import { useInfiniteQuery, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

export const bibleQueryKeys = {
  all: ['bible'] as const,
  books: () => [...bibleQueryKeys.all, 'books'] as const,
  booksInfinite: () => [...bibleQueryKeys.all, 'books-infinite'] as const,
  chapter: (abbrev: string, chapter: number) =>
    [...bibleQueryKeys.all, 'chapter', abbrev, chapter] as const,
};

interface BibleBooksResponse {
  books: Array<{
    id: string;
    name: string;
    abbrev: string;
    chapters: number;
  }>;
}

const PAGE_SIZE = 10;

/**
 * Query para carregar livros da Bíblia com pagination
 * Usa infinite query para lazy-load enquanto user scrolls
 */
export function useBibleBooksInfinite(
  options?: Omit<
    UseInfiniteQueryOptions<any, Error, any, any, any>,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >
) {
  return useInfiniteQuery({
    queryKey: bibleQueryKeys.booksInfinite(),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `/api/bible/books?page=${pageParam}&limit=${PAGE_SIZE}`
      );
      if (!response.ok) throw new Error('Failed to fetch books');
      return response.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
    ...options,
  });
}

/**
 * Hook para invalidar cache de livros após busca ou filtro
 */
export function useInvalidateBibleBooks() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: bibleQueryKeys.booksInfinite(),
    });
  };
}
