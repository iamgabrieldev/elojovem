import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { todayDateOnly } from "@/lib/utils";
import { calculateStreak } from "@/modules/habit/streak";
import { ensureTodayDevotional } from "@/modules/devotional/ensure-today";
import { GreetingCard } from "@/components/features/dashboard/greeting-card";
import { DevotionalCard } from "@/components/features/dashboard/devotional-card";
import { HabitChecklist } from "@/components/features/dashboard/habit-checklist";
import { MentorCta } from "@/components/features/dashboard/mentor-cta";
import { PrayersCta } from "@/components/features/dashboard/prayers-cta";
import { RosaryCta } from "@/components/features/dashboard/rosary-cta";
import { SaintCard } from "@/components/features/dashboard/saint-card";
import { BibleCtaCard } from "@/components/features/dashboard/bible-cta-card";
import { CuratedMediaSection } from "@/components/features/dashboard/curated-media-section";
import { ComicOfDayCard } from "@/components/features/dashboard/comic-of-day-card";
import { PsalmOfDayCard } from "@/components/features/dashboard/psalm-of-day-card";
import { QuizHubCard } from "@/components/features/dashboard/quiz-hub-card";
import { fetchDailyLiturgy } from "@/lib/liturgy/daily";
import { getSaintOfDay } from "@/lib/saints/today";
import type { HabitType } from "@/lib/types/domain";
import {
  dateKey,
  getHabitLogsForDate,
  getUserProfile,
} from "@/lib/firestore/repos";
import { getQuizAttempt, getQuizStreak } from "@/lib/firestore/quiz-repos";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/login");
  if (!user.onboardingCompleted) redirect("/tradicao");

  const today = todayDateOnly();

  const [devotionalResult, saint, liturgy, todayHabits, streak, quizAttempt] =
    await Promise.allSettled([
      user.tradition ? ensureTodayDevotional(user.tradition) : Promise.resolve(null),
      getSaintOfDay(today),
      fetchDailyLiturgy(today),
      getHabitLogsForDate(user.id, today),
      calculateStreak(user.id),
      getQuizAttempt(user.id, dateKey(today)),
    ]);

  const devotional =
    devotionalResult.status === "fulfilled" && devotionalResult.value
      ? devotionalResult.value.devotional
      : null;

  const saintData =
    saint.status === "fulfilled" ? saint.value : null;

  let psalm: { reference: string; refrain: string; text: string } | null = null;
  if (liturgy.status === "fulfilled") {
    const todayPsalm = liturgy.value.leituras.salmo?.[0];
    if (todayPsalm?.texto) {
      psalm = {
        reference: todayPsalm.referencia,
        refrain: todayPsalm.refrao ?? "",
        text: todayPsalm.texto,
      };
    }
  }

  const habitsData =
    todayHabits.status === "fulfilled" ? todayHabits.value : [];
  const streakData = streak.status === "fulfilled" ? streak.value : 0;
  const quizAttemptData =
    quizAttempt.status === "fulfilled" ? quizAttempt.value : null;

  const quizStreak = quizAttemptData
    ? await getQuizStreak(user.id, dateKey(today)).catch(() => 0)
    : 0;

  const completedHabits: HabitType[] = habitsData.map((h) => h.habitType);

  return (
    <div className="flex flex-col gap-6">
      <ErrorBoundary>
        <GreetingCard name={user.name} streak={streakData} />
      </ErrorBoundary>

      <ErrorBoundary>
        <ComicOfDayCard date={new Date()} />
      </ErrorBoundary>

      {saintData && (
        <ErrorBoundary>
          <SaintCard saint={saintData} />
        </ErrorBoundary>
      )}

      {psalm && (
        <ErrorBoundary>
          <PsalmOfDayCard psalm={psalm} />
        </ErrorBoundary>
      )}

      <ErrorBoundary>
        <DevotionalCard
          verse={devotional?.verse}
          verseReference={devotional?.verseReference}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <BibleCtaCard />
      </ErrorBoundary>

      <ErrorBoundary>
        <HabitChecklist completed={completedHabits} />
      </ErrorBoundary>

      <ErrorBoundary>
        <QuizHubCard streak={quizStreak} completedToday={Boolean(quizAttemptData)} />
      </ErrorBoundary>

      <ErrorBoundary>
        <CuratedMediaSection tradition={user.tradition} />
      </ErrorBoundary>

      <div className="grid grid-cols-1 gap-3">
        <ErrorBoundary>
          <RosaryCta />
        </ErrorBoundary>

        <ErrorBoundary>
          <MentorCta />
        </ErrorBoundary>

        <ErrorBoundary>
          <PrayersCta />
        </ErrorBoundary>
      </div>
    </div>
  );
}
