import { redirect } from "next/navigation";
import { getAppSettings } from "@/lib/firestore/repos";
import type { UserProfile } from "@/lib/types/domain";

/** Bloqueia app/onboarding até o pagamento pós-cadastro (email/senha) estar concluído. */
export async function assertRegistrationPaymentDone(
  user: Pick<
    UserProfile,
    | "requiresPaymentCompletion"
    | "paymentCompleted"
    | "onboardingCompleted"
  >
) {
  const settings = await getAppSettings();
  if (!settings.registrationPaymentEnabled) {
    return;
  }

  if (user.requiresPaymentCompletion && !user.paymentCompleted) {
    redirect("/registro/pagamento");
  }
}
