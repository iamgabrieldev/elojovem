"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { todayDateOnly } from "@/lib/utils";
import {
  getRecentReflections as getRecentReflectionsFs,
  upsertReflection,
} from "@/lib/firestore/repos";

const reflectionSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  gratitude: z.string().min(2, "Escreva pelo menos 2 caracteres."),
  improve: z.string().min(2, "Escreva pelo menos 2 caracteres."),
  confession: z.string().optional(),
  intention: z.string().optional(),
});

export type ReflectionState = { error?: string; success?: boolean };

export async function saveReflectionAction(
  _prev: ReflectionState,
  formData: FormData
): Promise<ReflectionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = reflectionSchema.safeParse({
    rating: formData.get("rating"),
    gratitude: String(formData.get("gratitude") ?? "").trim(),
    improve: String(formData.get("improve") ?? "").trim(),
    confession: String(formData.get("confession") ?? "").trim() || undefined,
    intention: String(formData.get("intention") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const today = todayDateOnly();
  await upsertReflection(session.user.id, today, parsed.data);

  return { success: true };
}

export async function getRecentReflections(limit = 14) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return getRecentReflectionsFs(session.user.id, limit);
}
