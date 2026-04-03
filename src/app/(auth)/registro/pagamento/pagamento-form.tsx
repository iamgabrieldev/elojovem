"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  createRegistrationCheckoutAction,
  type CheckoutState,
} from "@/modules/payment/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "@/components/features/onboarding/step-indicator";
import { PixInlineCheckout } from "@/components/features/payment/pix-inline-checkout";

type Props = {
  amountLabel: string;
  productName: string;
  cardEnabled: boolean;
};

type Method = "PIX" | "CARD";

export function PagamentoForm({ amountLabel, productName, cardEnabled }: Props) {
  const [state, action, pending] = useActionState<
    CheckoutState,
    FormData
  >(createRegistrationCheckoutAction, {});
  const [method, setMethod] = useState<Method>("PIX");

  const methods = useMemo(() => {
    const base: Array<{ id: Method; label: string; hint: string }> = [
      { id: "PIX", label: "Pix", hint: "QR Code dentro do app" },
    ];
    if (cardEnabled) {
      base.push({ id: "CARD", label: "Cartão", hint: "Checkout seguro AbacatePay" });
    }
    return base;
  }, [cardEnabled]);

  useEffect(() => {
    if (state.checkoutUrl) {
      window.location.href = state.checkoutUrl;
    }
  }, [state.checkoutUrl]);

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator currentStep={2} totalSteps={2} />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Pagamento</h1>
        <p className="mt-1 text-sm text-slate-500">
          Etapa 2 de 2 — finalize com AbacatePay (PIX ou cartão)
        </p>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-center text-sm text-slate-700">
        <p className="font-medium text-slate-900">{productName}</p>
        <p className="text-lg font-semibold text-amber-800 mt-0.5">
          {amountLabel}
        </p>
        <p className="text-xs text-slate-500 mt-1">Pagamento único</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className={[
              "rounded-2xl border px-3 py-3 text-left transition-colors",
              method === m.id
                ? "border-amber-300 bg-amber-50"
                : "border-slate-200 bg-white hover:bg-slate-50",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-slate-900">{m.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.hint}</p>
          </button>
        ))}
      </div>

      <form action={action} className="flex flex-col gap-4">
        <p className="text-xs text-slate-500">
          Precisamos desses dados para gerar a cobrança.
        </p>
        <Input
          label="Celular (com DDD)"
          name="cellphone"
          type="tel"
          placeholder="(11) 99999-9999"
          required
          defaultValue=""
        />
        <Input
          label="CPF"
          name="taxId"
          placeholder="000.000.000-00"
          required
          autoComplete="off"
        />

        {state.error && (
          <p className="text-sm text-red-600 text-center">{state.error}</p>
        )}

        {method === "CARD" ? (
          <Button type="submit" loading={pending} className="w-full mt-2">
            {pending ? "Abrindo checkout…" : "Pagar com cartão"}
          </Button>
        ) : (
          <Button type="submit" loading={pending} className="w-full mt-2">
            {pending ? "Salvando dados…" : "Continuar"}
          </Button>
        )}
      </form>

      {method === "PIX" ? (
        <div className="pt-1">
          <PixInlineCheckout />
        </div>
      ) : null}
    </div>
  );
}
