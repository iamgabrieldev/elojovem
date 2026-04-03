import { redirect } from "next/navigation";
import type { UserProfile } from "@/lib/types/domain";

/** Bloqueia app/onboarding até o pagamento pós-cadastro (email/senha) estar concluído. */
export function assertRegistrationPaymentDone(
  user: Pick<
    UserProfile,
    | "requiresPaymentCompletion"
    | "paymentCompleted"
    | "onboardingCompleted"
  >
) {
  if (user.requiresPaymentCompletion && !user.paymentCompleted) {
    redirect("/registro/pagamento");
  }
}
