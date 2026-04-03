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
import { getSaintOfDay } from "@/lib/saints/today";
import type { HabitType } from "@/lib/types/domain";
import {
  getHabitLogsForDate,
  getUserProfile,
} from "@/lib/firestore/repos";

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

  const [todayHabits, streak] = await Promise.all([
    getHabitLogsForDate(user.id, today),
    calculateStreak(user.id),
  ]);

  const completedHabits: HabitType[] = todayHabits.map((h) => h.habitType);

  return (
    <div className="flex flex-col gap-6">
      <GreetingCard name={user.name} streak={streak} />
      {saint ? <SaintCard saint={saint} /> : null}
      <DevotionalCard
        verse={devotional?.verse}
        verseReference={devotional?.verseReference}
      />
      <HabitChecklist completed={completedHabits} />
      <div className="grid grid-cols-1 gap-3">
        <ChurchesCta />
        {user.tradition === "CATHOLIC" ? <RosaryCta /> : null}
        <MentorCta />
        <PrayersCta />
      </div>
    </div>
  );
}
