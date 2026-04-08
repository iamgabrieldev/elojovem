"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { getAppSettings, getUserProfile, updateAppSettings } from "@/lib/firestore/repos";

export type AdminFeatureFlagResult =
  | { ok: true; enabled: boolean }
  | { ok: false; error: string };

export async function setRegistrationPaymentEnabledAction(
  enabled: boolean
): Promise<AdminFeatureFlagResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Faça login para continuar." };
  }

  const user = await getUserProfile(session.user.id);
  if (!user?.isAdmin) {
    return { ok: false, error: "Apenas administradores podem alterar essa flag." };
  }

  await updateAppSettings({
    registrationPaymentEnabled: enabled,
  });

  revalidatePath("/perfil");
  revalidatePath("/registro/pagamento");
  revalidatePath("/dashboard");
  revalidatePath("/tradicao");

  const settings = await getAppSettings();
  return { ok: true, enabled: settings.registrationPaymentEnabled };
}
