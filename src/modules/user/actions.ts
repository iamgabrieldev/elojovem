"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { GoalType } from "@/lib/types/domain";
import { updateUser } from "@/lib/firestore/repos";

const goalsSchema = z
  .array(
    z.enum(["ANXIETY", "DISCIPLINE", "PURPOSE", "FAITH", "RELATIONSHIPS"])
  )
  .min(1, "Selecione pelo menos um objetivo");

const dailyTimeSchema = z.coerce
  .number()
  .int()
  .min(5, "Mínimo 5 minutos")
  .max(120, "Máximo 120 minutos");

export async function setTradition() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await updateUser(session.user.id, { tradition: "CATHOLIC" });
  redirect("/objetivos");
}

export async function setGoals(goals: GoalType[]) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = goalsSchema.safeParse(goals);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Objetivos inválidos");
  }

  await updateUser(session.user.id, { goals: parsed.data });
  redirect("/tempo");
}

export async function setDailyTime(dailyTime: number) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = dailyTimeSchema.safeParse(dailyTime);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Tempo inválido");
  }

  await updateUser(session.user.id, {
    dailyTime: parsed.data,
    onboardingCompleted: true,
  });

  redirect("/dashboard");
}
