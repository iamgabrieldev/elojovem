import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RetornoPagamentoClient } from "./retorno-client";
import { getUserProfile } from "@/lib/firestore/repos";

export default async function RetornoPagamentoPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getUserProfile(session.user.id);

  if (!user) {
    redirect("/login");
  }

  if (!user.requiresPaymentCompletion) {
    redirect("/dashboard");
  }

  if (user.paymentCompleted) {
    redirect(user.onboardingCompleted ? "/dashboard" : "/tradicao");
  }

  return <RetornoPagamentoClient />;
}
