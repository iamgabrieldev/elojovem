"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { todayDateOnly } from "@/lib/utils";
import type { HabitType } from "@/lib/types/domain";
import { revalidatePath } from "next/cache";
import {
  getHabitLogsForDate,
  toggleHabitLog,
} from "@/lib/firestore/repos";

export async function toggleHabit(habitType: HabitType) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayDateOnly();
  await toggleHabitLog(session.user.id, habitType, today);

  revalidatePath("/dashboard");
  revalidatePath("/habitos");
}

export async function getTodayHabits(userId: string) {
  const today = todayDateOnly();
  return getHabitLogsForDate(userId, today);
}
