/**
 * Planos de acesso — valores em centavos (BRL).
 * Anual: total equivalente a 12 × R$ 19,90 = R$ 238,80 (pagamento único no checkout AbacatePay).
 */

import type { SubscriptionPlanId } from "@/lib/types/domain";

export type { SubscriptionPlanId } from "@/lib/types/domain";

export type PlanDefinition = {
  id: SubscriptionPlanId;
  label: string;
  /** Texto curto para cards de seleção */
  priceHint: string;
  /** Detalhe do valor (parcelamento / período) */
  detail: string;
  priceCents: number;
  externalId: string;
  name: string;
  description: string;
  /** AbacatePay v1: ONE_TIME ou MULTIPLE_PAYMENTS */
  frequency: "ONE_TIME" | "MULTIPLE_PAYMENTS";
};

function parseCents(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 100 ? n : fallback;
}

export function getPlan(planId: string | null | undefined): PlanDefinition | null {
  const id = (planId ?? "").toUpperCase();
  if (id === "MONTHLY") return getMonthlyPlan();
  if (id === "ANNUAL") return getAnnualPlan();
  return null;
}

export function getMonthlyPlan(): PlanDefinition {
  const priceCents = parseCents(
    process.env.ABACATEPAY_PLAN_MONTHLY_PRICE_CENTS,
    3490
  );
  const baseExternal =
    process.env.ABACATEPAY_PRODUCT_EXTERNAL_ID?.trim() || "elojovem-acesso";
  return {
    id: "MONTHLY",
    label: "Plano mensal",
    priceHint: "R$ 34,90",
    detail: "Por mês, renovação conforme uso do app.",
    priceCents,
    externalId: `${baseExternal}-mensal`,
    name:
      process.env.ABACATEPAY_PLAN_MONTHLY_NAME?.trim() ||
      "Elo Jovem — Plano mensal",
    description:
      process.env.ABACATEPAY_PLAN_MONTHLY_DESCRIPTION?.trim() ||
      "Acesso completo ao app por 1 mês.",
    frequency: "ONE_TIME",
  };
}

export function getAnnualPlan(): PlanDefinition {
  const priceCents = parseCents(
    process.env.ABACATEPAY_PLAN_ANNUAL_PRICE_CENTS,
    23880
  );
  const baseExternal =
    process.env.ABACATEPAY_PRODUCT_EXTERNAL_ID?.trim() || "elojovem-acesso";
  return {
    id: "ANNUAL",
    label: "Plano anual",
    priceHint: "12x de R$ 19,90",
    detail: "Total R$ 238,80 em pagamento único (Pix ou cartão).",
    priceCents,
    externalId: `${baseExternal}-anual`,
    name:
      process.env.ABACATEPAY_PLAN_ANNUAL_NAME?.trim() ||
      "Elo Jovem — Plano anual",
    description:
      process.env.ABACATEPAY_PLAN_ANNUAL_DESCRIPTION?.trim() ||
      "Acesso anual: equivalente a 12 parcelas de R$ 19,90 (total R$ 238,80).",
    frequency: "ONE_TIME",
  };
}

export const DEFAULT_PLAN_ID: SubscriptionPlanId = "MONTHLY";

export function formatBrlFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
