import { todayDateOnly } from "@/lib/utils";
import { getHabitLogsForDate } from "@/lib/firestore/repos";

export async function calculateStreak(userId: string): Promise<number> {
  const today = todayDateOnly();
  let streak = 0;
  let checkDate = new Date(today);

  while (true) {
    const logs = await getHabitLogsForDate(userId, checkDate);

    if (logs.length === 0) {
      if (streak === 0 && checkDate.getTime() === today.getTime()) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }

    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}
