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
import { ChurchesCta } from "@/components/features/dashboard/churches-cta";
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

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserProfile(session.user.id);

  if (!user) redirect("/login");
  if (!user.onboardingCompleted) redirect("/tradicao");

  const today = todayDateOnly();

  let devotional = null;
  if (user.tradition) {
    try {
      devotional = (await ensureTodayDevotional(user.tradition)).devotional;
    } catch {
      devotional = null;
    }
  }

  const saint =
    user.tradition === "CATHOLIC"
      ? await getSaintOfDay(today).catch(() => null)
      : null;

  let psalm: { reference: string; refrain: string; text: string } | null = null;
  try {
    const liturgy = await fetchDailyLiturgy(today);
    const todayPsalm = liturgy.leituras.salmo?.[0];
    if (todayPsalm?.texto) {
      psalm = {
        reference: todayPsalm.referencia,
        refrain: todayPsalm.refrao ?? "",
        text: todayPsalm.texto,
      };
    }
  } catch {
    psalm = null;
  }

  const dk = dateKey(today);

  const [todayHabits, streak, quizAttempt] = await Promise.all([
    getHabitLogsForDate(user.id, today),
    calculateStreak(user.id),
    getQuizAttempt(user.id, dk),
  ]);

  const quizStreak = quizAttempt
    ? await getQuizStreak(user.id, dk)
    : 0;

  const completedHabits: HabitType[] = todayHabits.map((h) => h.habitType);

  return (
    <div className="flex flex-col gap-6">
      <GreetingCard name={user.name} streak={streak} />
      <ComicOfDayCard tradition={user.tradition} date={new Date()} />
      {saint ? <SaintCard saint={saint} /> : null}
      {psalm ? <PsalmOfDayCard psalm={psalm} /> : null}
      <DevotionalCard
        verse={devotional?.verse}
        verseReference={devotional?.verseReference}
      />
      <BibleCtaCard />
      <HabitChecklist completed={completedHabits} />
      <QuizHubCard streak={quizStreak} completedToday={Boolean(quizAttempt)} />
      <CuratedMediaSection tradition={user.tradition} />
      <div className="grid grid-cols-1 gap-3">
        <ChurchesCta />
        {user.tradition === "CATHOLIC" ? <RosaryCta /> : null}
        <MentorCta />
        <PrayersCta />
      </div>
    </div>
  );
}
