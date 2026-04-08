import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PagamentoForm } from "./pagamento-form";
import { getAppSettings, getUserProfile } from "@/lib/firestore/repos";
import {
  formatBrlFromCents,
  getAnnualPlan,
  getMonthlyPlan,
} from "@/lib/plans";

export default async function RegistroPagamentoPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getUserProfile(session.user.id);
  const settings = await getAppSettings();

  if (!user) {
    redirect("/login");
  }

  if (!settings.registrationPaymentEnabled) {
    redirect(user.onboardingCompleted ? "/dashboard" : "/tradicao");
  }

  if (!user.requiresPaymentCompletion) {
    redirect("/dashboard");
  }

  if (user.paymentCompleted) {
    redirect(user.onboardingCompleted ? "/dashboard" : "/tradicao");
  }

  const monthly = getMonthlyPlan();
  const annual = getAnnualPlan();
  const cardEnabled = (process.env.ABACATEPAY_PAYMENT_METHODS ?? "PIX,CARD")
    .split(",")
    .map((m) => m.trim().toUpperCase())
    .includes("CARD");

  return (
    <PagamentoForm
      cardEnabled={cardEnabled}
      monthly={{
        label: monthly.label,
        priceHint: `${formatBrlFromCents(monthly.priceCents)}/mês`,
        detail: monthly.detail,
        formattedTotal: formatBrlFromCents(monthly.priceCents),
      }}
      annual={{
        label: annual.label,
        priceHint: annual.priceHint,
        detail: annual.detail,
        formattedTotal: formatBrlFromCents(annual.priceCents),
      }}
    />
  );
}
