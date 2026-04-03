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
import { getUserProfile, updateUser } from "@/lib/firestore/repos";

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
});

export type CheckoutState = {
  error?: string;
  checkoutUrl?: string;
  pixQrCode?: {
    id: string;
    brCode: string;
    brCodeBase64?: string;
    expiresAt?: string;
  };
};

function productConfig() {
  const price = Number(process.env.ABACATEPAY_PRODUCT_PRICE_CENTS ?? "2900");
  const safePrice = Number.isFinite(price) && price >= 100 ? price : 2900;
  return {
    externalId:
      process.env.ABACATEPAY_PRODUCT_EXTERNAL_ID?.trim() || "elojovem-acesso",
    name:
      process.env.ABACATEPAY_PRODUCT_NAME?.trim() || "Acesso Elo Jovem",
    description:
      process.env.ABACATEPAY_PRODUCT_DESCRIPTION?.trim() ||
      "Acesso ao app e conteúdos personalizados.",
    price: safePrice,
  };
}

function getEnabledMethods(): AbacatePaymentMethod[] {
  const raw = process.env.ABACATEPAY_PAYMENT_METHODS ?? "PIX";
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

  if (!user) {
    return { error: "Usuário não encontrado." };
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
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { cellphone, taxId } = parsed.data;
  const appUrl = getAppUrl();
  const product = productConfig();
  const methods = getEnabledMethods();

  try {
    const billing = await createBilling({
      frequency: "ONE_TIME",
      methods,
      products: [
        {
          externalId: product.externalId,
          name: product.name,
          description: product.description,
          quantity: 1,
          price: product.price,
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
      metadata: { userId: user.id },
    });

    await updateUser(user.id, {
      cellphone,
      taxId,
      abacateBillingId: billing.id,
    });

    return { checkoutUrl: billing.url };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Falha ao criar cobrança.";
    return { error: msg };
  }
}

export async function createRegistrationPixQrCodeAction(): Promise<
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
  if (!user) return { ok: false, error: "Usuário não encontrado." };
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

  const product = productConfig();

  try {
    const qr = await createPixQrCode({
      amount: product.price,
      expiresIn: 60 * 30,
      description: (product.name ?? "Pagamento").slice(0, 37),
      customer: {
        name: user.name ?? "Cliente",
        cellphone: user.cellphone,
        email: user.email,
        taxId: user.taxId,
      },
      metadata: { userId: user.id, kind: "registration" },
    });

    await updateUser(user.id, { abacateBillingId: qr.id });

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
