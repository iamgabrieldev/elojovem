"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { todayDateOnly } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { Tradition } from "@/lib/types/domain";
import {
  getDevotional,
  markDevotionalCompletedFs,
  toggleDevotionalSavedFs,
} from "@/lib/firestore/repos";

export async function getTodayDevotional(tradition: Tradition) {
  const today = todayDateOnly();
  return getDevotional(tradition, today);
}

export async function markDevotionalCompleted(devotionalId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await markDevotionalCompletedFs(session.user.id, devotionalId);

  revalidatePath("/dashboard");
  revalidatePath("/devocional");
}

export async function toggleDevotionalSaved(devotionalId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await toggleDevotionalSavedFs(session.user.id, devotionalId);

  revalidatePath("/devocional");
}
