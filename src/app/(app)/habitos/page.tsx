import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { todayDateOnly } from "@/lib/utils";
import { calculateStreak } from "@/modules/habit/streak";
import { HabitChecklist } from "@/components/features/dashboard/habit-checklist";
import { StreakCalendar } from "@/components/features/habits/streak-calendar";
import { StreakBadges } from "@/components/features/habits/streak-badges";
import { StreakAnimation } from "@/components/features/habits/streak-animation";
import { WeeklyChart } from "@/components/features/habits/weekly-chart";
import type { HabitType } from "@/lib/types/domain";
import {
  getHabitLogsForDate,
  getHabitLogsInRange,
} from "@/lib/firestore/repos";

export default async function HabitosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayDateOnly();
  const streak = await calculateStreak(session.user.id);

  const todayHabits = await getHabitLogsForDate(session.user.id, today);
  const completedHabits: HabitType[] = todayHabits.map((h) => h.habitType);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLogs = await getHabitLogsInRange(
    session.user.id,
    startOfMonth.toISOString().slice(0, 10),
    today.toISOString().slice(0, 10)
  );

  const activeDays = [...new Set(monthLogs.map((l) => l.dateKey))];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const count = monthLogs.filter((l) => l.dateKey === dateStr).length;
    return { day: dayNames[d.getDay()], count };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hábitos Espirituais</h1>
      </div>

      <StreakAnimation streak={streak} />

      <HabitChecklist completed={completedHabits} />

      <WeeklyChart weekData={weekData} />

      <StreakBadges streak={streak} />

      <StreakCalendar activeDays={activeDays} />
    </div>
  );
}
