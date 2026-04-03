"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createPrayer as insertPrayerDoc,
  deletePrayer as removePrayerDoc,
  updatePrayer as patchPrayerDoc,
} from "@/lib/firestore/repos";
import { FieldValue } from "firebase-admin/firestore";

const prayerSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
});

export type PrayerState = { error?: string; success?: boolean };

export async function createPrayer(
  _prev: PrayerState,
  formData: FormData
): Promise<PrayerState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = prayerSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await insertPrayerDoc(
    session.user.id,
    parsed.data.title,
    parsed.data.description || null
  );

  revalidatePath("/oracoes");
  return { success: true };
}

export async function markPrayerAnswered(prayerId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await patchPrayerDoc(session.user.id, prayerId, {
    answered: true,
    answeredAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/oracoes");
}

export async function deletePrayerAction(prayerId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await removePrayerDoc(session.user.id, prayerId);

  revalidatePath("/oracoes");
}
