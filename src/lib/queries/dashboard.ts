import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  getHabitLogsForDate,
  dateKey,
  getUserProfile,
} from '@/lib/firestore/repos';
import { calculateStreak } from '@/modules/habit/streak';
import { getQuizAttempt, getQuizStreak } from '@/lib/firestore/quiz-repos';
import { ensureTodayDevotional } from '@/modules/devotional/ensure-today';
import { fetchDailyLiturgy } from '@/lib/liturgy/daily';
import { getSaintOfDay } from '@/lib/saints/today';
import { todayDateOnly } from '@/lib/utils';
import type { HabitType, Tradition } from '@/lib/types/domain';

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  habits: (userId: string) => [...dashboardQueryKeys.all, 'habits', userId] as const,
  streak: (userId: string) => [...dashboardQueryKeys.all, 'streak', userId] as const,
  quiz: (userId: string) => [...dashboardQueryKeys.all, 'quiz', userId] as const,
  devotional: (tradition: string | null) =>
    [...dashboardQueryKeys.all, 'devotional', tradition] as const,
  saint: () => [...dashboardQueryKeys.all, 'saint'] as const,
  psalm: () => [...dashboardQueryKeys.all, 'psalm'] as const,
};

/**
 * Query para hábitos de hoje
 */
export function useHabitsQuery(
  userId: string | undefined,
  options?: Omit<UseQueryOptions<HabitType[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardQueryKeys.habits(userId || 'unknown'),
    queryFn: async () => {
      if (!userId) throw new Error('userId is required');
      const today = todayDateOnly();
      const habits = await getHabitLogsForDate(userId, today);
      return habits.map((h) => h.habitType);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 min
    ...options,
  });
}

/**
 * Query para streak de hábitos
 */
export function useStreakQuery(
  userId: string | undefined,
  options?: Omit<UseQueryOptions<number>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardQueryKeys.streak(userId || 'unknown'),
    queryFn: async () => {
      if (!userId) throw new Error('userId is required');
      return calculateStreak(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 min
    ...options,
  });
}

/**
 * Query para quiz de hoje
 */
export async function useQuizQuery(
  userId: string | undefined,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardQueryKeys.quiz(userId || 'unknown'),
    queryFn: async () => {
      if (!userId) throw new Error('userId is required');
      const today = todayDateOnly();
      const dk = dateKey(today);
      const attempt = await getQuizAttempt(userId, dk);
      const streak = attempt ? await getQuizStreak(userId, dk) : 0;
      return { attempt, streak };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 min
    ...options,
  });
}

/**
 * Query para devocional de hoje
 */
export function useDevotionalQuery(
  tradition: Tradition | null | undefined,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardQueryKeys.devotional(tradition || null),
    queryFn: async () => {
      if (!tradition) throw new Error('tradition is required');
      const result = await ensureTodayDevotional(tradition as Tradition);
      return result.devotional;
    },
    enabled: !!tradition,
    staleTime: 1000 * 60 * 60 * 24, // 24h (muda só uma vez por dia)
    ...options,
  });
}

/**
 * Query para santo do dia (Catholic)
 */
export function useSaintQuery(
  isCatholic: boolean,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardQueryKeys.saint(),
    queryFn: async () => {
      const today = todayDateOnly();
      return getSaintOfDay(today);
    },
    enabled: isCatholic,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    ...options,
  });
}

/**
 * Query para salmo do dia
 */
export function usePsalmQuery(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dashboardQueryKeys.psalm(),
    queryFn: async () => {
      const today = todayDateOnly();
      const liturgy = await fetchDailyLiturgy(today);
      const todayPsalm = liturgy.leituras.salmo?.[0];
      if (todayPsalm?.texto) {
        return {
          reference: todayPsalm.referencia,
          refrain: todayPsalm.refrao ?? '',
          text: todayPsalm.texto,
        };
      }
      return null;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
    ...options,
  });
}
