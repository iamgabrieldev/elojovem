import {
  QueryClient,
  DefaultError,
  QueryClientConfig,
} from '@tanstack/react-query';

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale time: dados consideram "stale" após esse tempo
      staleTime: 1000 * 60 * 5, // 5 minutos por padrão
      
      // Garbage collection: remove dados não usados após esse tempo
      gcTime: 1000 * 60 * 10, // 10 minutos (antes era cacheTime)
      
      // Retry attempts para falhas de rede
      retry: (failureCount, error: any) => {
        // Não retry em 404, 401, 403
        if (error?.status === 404 || error?.status === 401 || error?.status === 403) {
          return false;
        }
        
        // Retry máximo 3 vezes para outros erros
        return failureCount < 3;
      },
      
      // Delay entre retries (exponential backoff)
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Deduplication: requisições iguais feitas simultaneamente = 1 request
      throwOnError: false,
    },

    mutations: {
      retry: 1,
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
};

export function makeQueryClient() {
  return new QueryClient(queryConfig);
}

let clientSingleton: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }

  // Browser: make a single query client for the lifetime of the app
  if (!clientSingleton) clientSingleton = makeQueryClient();
  return clientSingleton;
}
