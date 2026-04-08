"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createRegistrationCheckoutAction,
  saveRegistrationPlanAndCustomerAction,
} from "@/modules/payment/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "@/components/features/onboarding/step-indicator";
import { PixInlineCheckout } from "@/components/features/payment/pix-inline-checkout";
import type { SubscriptionPlanId } from "@/lib/types/domain";

type Props = {
  cardEnabled: boolean;
  monthly: {
    label: string;
    priceHint: string;
    detail: string;
    formattedTotal: string;
  };
  annual: {
    label: string;
    priceHint: string;
    detail: string;
    formattedTotal: string;
  };
};

type Method = "PIX" | "CARD";

export function PagamentoForm({ cardEnabled, monthly, annual }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlanId>("MONTHLY");
  const [method, setMethod] = useState<Method>("PIX");
  const [pixUnlocked, setPixUnlocked] = useState(false);

  const methods = useMemo(() => {
    const base: Array<{ id: Method; label: string; hint: string }> = [
      { id: "PIX", label: "Pix", hint: "QR Code no app" },
    ];
    if (cardEnabled) {
      base.push({
        id: "CARD",
        label: "Cartão",
        hint: "Checkout seguro AbacatePay",
      });
    }
    return base;
  }, [cardEnabled]);

  function selectPlan(id: SubscriptionPlanId) {
    setPlan(id);
    setPixUnlocked(false);
    setError(null);
  }

  function selectMethod(m: Method) {
    setMethod(m);
    setPixUnlocked(false);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("plan", plan);

    startTransition(async () => {
      setError(null);
      if (method === "CARD") {
        const r = await createRegistrationCheckoutAction({}, fd);
        if (r.checkoutUrl) {
          window.location.href = r.checkoutUrl;
          return;
        }
        if (r.error) setError(r.error);
        return;
      }
      const r = await saveRegistrationPlanAndCustomerAction({}, fd);
      if (r.savedForPix) {
        setPixUnlocked(true);
      } else if (r.error) {
        setError(r.error);
      }
    });
  }

  const planCards = [
    {
      id: "MONTHLY" as const,
      title: monthly.label,
      price: monthly.priceHint,
      detail: monthly.detail,
      total: monthly.formattedTotal,
    },
    {
      id: "ANNUAL" as const,
      title: annual.label,
      price: annual.priceHint,
      detail: annual.detail,
      total: annual.formattedTotal,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator currentStep={2} totalSteps={2} />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Escolha seu plano</h1>
        <p className="mt-1 text-sm text-slate-500">
          Mensal ou anual — depois, Pix ou cartão (AbacatePay)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {planCards.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => selectPlan(p.id)}
            className={[
              "rounded-2xl border px-4 py-4 text-left transition-colors",
              plan === p.id
                ? "border-amber-400 bg-amber-50/90 ring-2 ring-amber-200"
                : "border-slate-200 bg-white hover:bg-slate-50",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-slate-900">{p.title}</p>
            <p className="text-lg font-bold text-amber-800 mt-1">{p.price}</p>
            <p className="text-xs text-slate-500 mt-1">{p.detail}</p>
            <p className="text-xs font-medium text-slate-600 mt-2">
              Total: {p.total}
            </p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => selectMethod(m.id)}
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="hidden" name="plan" value={plan} />

        <p className="text-xs text-slate-500">
          Dados para a cobrança (AbacatePay).
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

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <Button type="submit" loading={isPending} className="w-full mt-2">
          {method === "CARD"
            ? isPending
              ? "Abrindo checkout…"
              : "Pagar com cartão"
            : isPending
              ? "Salvando…"
              : "Salvar dados e preparar Pix"}
        </Button>
      </form>

      {method === "PIX" && pixUnlocked ? (
        <div className="pt-1 border-t border-slate-100">
          <p className="text-xs text-slate-500 text-center mb-3">
            Gere o QR Code no valor do plano escolhido (
            {plan === "MONTHLY" ? monthly.formattedTotal : annual.formattedTotal}
            ).
          </p>
          <PixInlineCheckout planId={plan} />
        </div>
      ) : null}
    </div>
  );
}
