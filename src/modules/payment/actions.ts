"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { getAppUrl } from "@/lib/app-url";
import {
  checkPixQrCodeStatus,
  createBilling,
  createPixQrCode,
  listBillings,
  type AbacatePaymentMethod,
} from "@/lib/abacatepay";
import { getPlan } from "@/lib/plans";
import {
  getAppSettings,
  getUserProfile,
  updateUser,
} from "@/lib/firestore/repos";
import type { SubscriptionPlanId } from "@/lib/types/domain";

const digits = (s: string) => s.replace(/\D/g, "");

const checkoutSchema = z.object({
  cellphone: z
    .string()
    .min(8, "Celular inválido")
    .transform((v) => digits(v))
    .refine((v) => v.length >= 10 && v.length <= 13, "Celular inválido"),
  taxId: z
    .string()
    .min(11, "CPF inválido")
    .transform((v) => digits(v))
    .refine((v) => v.length === 11, "CPF deve ter 11 dígitos"),
  plan: z.enum(["MONTHLY", "ANNUAL"]),
});

export type CheckoutState = {
  error?: string;
  checkoutUrl?: string;
  /** Dados salvos com sucesso antes de gerar Pix */
  savedForPix?: boolean;
  pixQrCode?: {
    id: string;
    brCode: string;
    brCodeBase64?: string;
    expiresAt?: string;
  };
};

function getEnabledMethods(): AbacatePaymentMethod[] {
  const raw = process.env.ABACATEPAY_PAYMENT_METHODS ?? "PIX,CARD";
  const methods = raw
    .split(",")
    .map((m) => m.trim().toUpperCase())
    .filter((m): m is AbacatePaymentMethod => m === "PIX" || m === "CARD");
  return methods.length ? methods : ["PIX"];
}

export async function createRegistrationCheckoutAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Faça login para continuar." };
  }

  const user = await getUserProfile(session.user.id);
  const settings = await getAppSettings();

  if (!user) {
    return { error: "Usuário não encontrado." };
  }

  if (!settings.registrationPaymentEnabled) {
    return {
      error:
        "O pagamento no cadastro está desativado no momento. Use o acesso gratuito desta campanha.",
    };
  }

  if (!user.requiresPaymentCompletion) {
    return { error: "Nenhum pagamento pendente para esta conta." };
  }

  if (user.paymentCompleted) {
    return { error: "Pagamento já confirmado." };
  }

  const parsed = checkoutSchema.safeParse({
    cellphone: formData.get("cellphone"),
    taxId: formData.get("taxId"),
    plan: formData.get("plan"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { cellphone, taxId, plan: planField } = parsed.data;
  const plan = getPlan(planField);
  if (!plan) {
    return { error: "Plano inválido." };
  }

  const appUrl = getAppUrl();
  const methods = getEnabledMethods();

  try {
    const billing = await createBilling({
      frequency: plan.frequency,
      methods,
      products: [
        {
          externalId: plan.externalId,
          name: plan.name,
          description: plan.description,
          quantity: 1,
          price: plan.priceCents,
        },
      ],
      returnUrl: `${appUrl}/registro/pagamento`,
      completionUrl: `${appUrl}/registro/pagamento/retorno`,
      customer: {
        name: user.name ?? "Cliente",
        cellphone,
        email: user.email,
        taxId,
      },
      externalId: user.id,
      metadata: {
        userId: user.id,
        planId: plan.id,
        planLabel: plan.label,
      },
    });

    await updateUser(user.id, {
      cellphone,
      taxId,
      abacateBillingId: billing.id,
      subscriptionPlan: plan.id as SubscriptionPlanId,
    });

    return { checkoutUrl: billing.url };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Falha ao criar cobrança.";
    return { error: msg };
  }
}

const planOnlySchema = z.enum(["MONTHLY", "ANNUAL"]);

export async function createRegistrationPixQrCodeAction(
  planIdRaw: string
): Promise<
  | {
      ok: true;
      qr: {
        id: string;
        brCode: string;
        brCodeBase64?: string;
        expiresAt?: string;
      };
    }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Faça login para continuar." };
  }

  const user = await getUserProfile(session.user.id);
  const settings = await getAppSettings();
  if (!user) return { ok: false, error: "Usuário não encontrado." };
  if (!settings.registrationPaymentEnabled) {
    return {
      ok: false,
      error: "O pagamento no cadastro está temporariamente desativado.",
    };
  }
  if (!user.requiresPaymentCompletion) {
    return { ok: false, error: "Nenhum pagamento pendente para esta conta." };
  }
  if (user.paymentCompleted) {
    return { ok: false, error: "Pagamento já confirmado." };
  }

  if (!user.cellphone || !user.taxId) {
    return {
      ok: false,
      error:
        "Informe seu celular e CPF primeiro para gerar o QR Code de pagamento.",
    };
  }

  const parsedPlan = planOnlySchema.safeParse(planIdRaw);
  const plan = getPlan(parsedPlan.success ? parsedPlan.data : null);
  if (!plan) {
    return { ok: false, error: "Selecione um plano válido antes do Pix." };
  }

  try {
    const qr = await createPixQrCode({
      amount: plan.priceCents,
      expiresIn: 60 * 30,
      description: (plan.name ?? "Pagamento").slice(0, 37),
      customer: {
        name: user.name ?? "Cliente",
        cellphone: user.cellphone,
        email: user.email,
        taxId: user.taxId,
      },
      metadata: {
        userId: user.id,
        kind: "registration",
        planId: plan.id,
      },
    });

    await updateUser(user.id, {
      abacateBillingId: qr.id,
      subscriptionPlan: plan.id as SubscriptionPlanId,
    });

    return {
      ok: true,
      qr: {
        id: qr.id,
        brCode: qr.brCode,
        brCodeBase64: qr.brCodeBase64,
        expiresAt: qr.expiresAt,
      },
    };
  } catch (e: unknown) {
    const msg =
      e instanceof Error ? e.message : "Falha ao criar QR Code PIX.";
    return { ok: false, error: msg };
  }
}

export async function checkRegistrationPixStatusAction(): Promise<
  | {
      ok: true;
      status:
        | "PENDING"
        | "EXPIRED"
        | "CANCELLED"
        | "PAID"
        | "REFUNDED";
      expiresAt?: string;
    }
  | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Não autenticado" };
  }

  const user = await getUserProfile(session.user.id);
  if (!user?.abacateBillingId) {
    return { ok: false, error: "Cobrança não encontrada." };
  }

  try {
    const r = await checkPixQrCodeStatus(user.abacateBillingId);
    if (r.status === "PAID") {
      await updateUser(user.id, { paymentCompleted: true });
    }
    return { ok: true, status: r.status, expiresAt: r.expiresAt };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao consultar o PIX.";
    return { ok: false, error: msg };
  }
}

/** Sincroniza status na AbacatePay (útil logo após o retorno do checkout). */
export async function syncRegistrationPaymentFromAbacateAction(): Promise<{
  paid: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { paid: false, error: "Não autenticado" };
  }

  const user = await getUserProfile(session.user.id);

  if (!user?.abacateBillingId) {
    return { paid: user?.paymentCompleted ?? false };
  }

  if (user.paymentCompleted) {
    return { paid: true };
  }

  try {
    const billings = await listBillings();
    const bill = billings.find((b) => b.id === user.abacateBillingId);
    if (bill?.status === "PAID") {
      await updateUser(user.id, { paymentCompleted: true });
      return { paid: true };
    }
  } catch (e: unknown) {
    try {
      const r = await checkPixQrCodeStatus(user.abacateBillingId);
      if (r.status === "PAID") {
        await updateUser(user.id, { paymentCompleted: true });
        return { paid: true };
      }
      return { paid: false };
    } catch {
      const msg =
        e instanceof Error ? e.message : "Erro ao consultar cobrança";
      return { paid: false, error: msg };
    }
  }

  return { paid: false };
}

/** Salva plano escolhido antes de gerar Pix (após preencher CPF/celular). */
export async function saveRegistrationPlanAndCustomerAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Faça login para continuar." };
  }

  const user = await getUserProfile(session.user.id);
  const settings = await getAppSettings();
  if (!settings.registrationPaymentEnabled) {
    return { error: "O pagamento no cadastro está temporariamente desativado." };
  }
  if (!user?.requiresPaymentCompletion || user.paymentCompleted) {
    return { error: "Nenhum pagamento pendente." };
  }

  const parsed = checkoutSchema.safeParse({
    cellphone: formData.get("cellphone"),
    taxId: formData.get("taxId"),
    plan: formData.get("plan"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { cellphone, taxId, plan: planField } = parsed.data;
  const plan = getPlan(planField);
  if (!plan) return { error: "Plano inválido." };

  try {
    await updateUser(session.user.id, {
      cellphone,
      taxId,
      subscriptionPlan: plan.id as SubscriptionPlanId,
    });
    return { savedForPix: true };
  } catch (e: unknown) {
    return {
      error: e instanceof Error ? e.message : "Falha ao salvar dados.",
    };
  }
}
