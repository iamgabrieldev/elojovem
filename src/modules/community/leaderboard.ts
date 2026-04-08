import { getAdminDb } from "@/lib/firebase-admin";
import type { HabitType, LeaderboardEntry } from "@/lib/types/domain";
import { todayDateOnly } from "@/lib/utils";

const LOOKBACK_DAYS = 60;

function shiftDateKey(dateKey: string, deltaDays: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const value = new Date(Date.UTC(year!, month! - 1, day!));
  value.setUTCDate(value.getUTCDate() + deltaDays);
  return value.toISOString().slice(0, 10);
}

function computeCurrentStreak(activeKeys: Set<string>, todayKey: string) {
  let streak = 0;
  let cursor = activeKeys.has(todayKey) ? todayKey : shiftDateKey(todayKey, -1);

  while (activeKeys.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return streak;
}

export async function getPrayerLeaderboard(
  limitCount = 15
): Promise<LeaderboardEntry[]> {
  const today = todayDateOnly();
  const endKey = today.toISOString().slice(0, 10);
  const startKey = shiftDateKey(endKey, -(LOOKBACK_DAYS - 1));

  const usersSnap = await getAdminDb()
    .collection("users")
    .where("onboardingCompleted", "==", true)
    .get();

  const entries = await Promise.all(
    usersSnap.docs.map(async (userDoc) => {
      const data = userDoc.data();
      const name = String(data.name ?? "").trim() || "Membro da comunidade";
      const dailyTime =
        typeof data.dailyTime === "number" && Number.isFinite(data.dailyTime)
          ? Math.max(1, Math.round(data.dailyTime))
          : 10;

      const logsSnap = await getAdminDb()
        .collection("users")
        .doc(userDoc.id)
        .collection("habitLogs")
        .where("dateKey", ">=", startKey)
        .where("dateKey", "<=", endKey)
        .get();

      const activeDays = new Set<string>();
      const prayerDays = new Set<string>();
      let lastActiveAt: Date | null = null;

      for (const log of logsSnap.docs) {
        const logData = log.data();
        if (!logData.completed) continue;

        const key = String(logData.dateKey ?? "");
        if (!key) continue;

        activeDays.add(key);
        if ((logData.habitType as HabitType) === "PRAYER") {
          prayerDays.add(key);
        }

        const createdAt =
          typeof logData.createdAt?.toDate === "function"
            ? (logData.createdAt.toDate() as Date)
            : null;
        if (createdAt && (!lastActiveAt || createdAt > lastActiveAt)) {
          lastActiveAt = createdAt;
        }
      }

      return {
        userId: userDoc.id,
        name,
        image: data.image ?? null,
        estimatedPrayerMinutes: prayerDays.size * dailyTime,
        prayerDays: prayerDays.size,
        activeDays: activeDays.size,
        currentStreak: computeCurrentStreak(activeDays, endKey),
        lastActiveAt,
      } satisfies LeaderboardEntry;
    })
  );

  return entries
    .filter((entry) => entry.prayerDays > 0 || entry.activeDays > 0)
    .sort((left, right) => {
      return (
        right.estimatedPrayerMinutes - left.estimatedPrayerMinutes ||
        right.currentStreak - left.currentStreak ||
        right.activeDays - left.activeDays ||
        left.name.localeCompare(right.name, "pt-BR")
      );
    })
    .slice(0, limitCount);
}
