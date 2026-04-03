import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PagamentoForm } from "./pagamento-form";
import { getUserProfile } from "@/lib/firestore/repos";

function formatBrl(cents: number): string {
  const v = cents / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function RegistroPagamentoPage() {
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

  const price = Number(process.env.ABACATEPAY_PRODUCT_PRICE_CENTS ?? "2900");
  const safe = Number.isFinite(price) && price >= 100 ? price : 2900;
  const productName =
    process.env.ABACATEPAY_PRODUCT_NAME?.trim() || "Acesso Elo Jovem";
  const cardEnabled = (process.env.ABACATEPAY_PAYMENT_METHODS ?? "PIX")
    .split(",")
    .map((m) => m.trim().toUpperCase())
    .includes("CARD");

  return (
    <PagamentoForm
      amountLabel={formatBrl(safe)}
      productName={productName}
      cardEnabled={cardEnabled}
    />
  );
}
