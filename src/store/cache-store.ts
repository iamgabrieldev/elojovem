import { create } from 'zustand';

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number; // milliseconds
}

interface CacheStore {
  cache: Map<string, CacheEntry>;
  set: (key: string, data: unknown, ttl?: number) => void;
  get: (key: string) => unknown | null;
  has: (key: string) => boolean;
  isExpired: (key: string) => boolean;
  remove: (key: string) => void;
  clear: () => void;
}

// Default TTL: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

export const useCacheStore = create<CacheStore>((set, get) => ({
  cache: new Map(),

  set: (key: string, data: unknown, ttl = DEFAULT_TTL) => {
    set((state) => {
      const newCache = new Map(state.cache);
      newCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      });
      return { cache: newCache };
    });
  },

  get: (key: string) => {
    const state = get();
    const entry = state.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      state.remove(key);
      return null;
    }

    return entry.data;
  },

  has: (key: string) => {
    const state = get();
    return !state.isExpired(key) && state.cache.has(key);
  },

  isExpired: (key: string) => {
    const state = get();
    const entry = state.cache.get(key);

    if (!entry) return true;

    return Date.now() - entry.timestamp > entry.ttl;
  },

  remove: (key: string) => {
    set((state) => {
      const newCache = new Map(state.cache);
      newCache.delete(key);
      return { cache: newCache };
    });
  },

  clear: () => {
    set({ cache: new Map() });
  },
}));
