"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { syncRegistrationPaymentFromAbacateAction } from "@/modules/payment/actions";
import { StepIndicator } from "@/components/features/onboarding/step-indicator";

export function RetornoPagamentoClient() {
  const router = useRouter();
  const [message, setMessage] = useState(
    "Confirmando pagamento com a AbacatePay…"
  );
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tick = async () => {
      const r = await syncRegistrationPaymentFromAbacateAction();
      if (cancelled) return;

      if (r.paid) {
        setMessage("Pagamento confirmado!");
        router.replace("/tradicao");
        return;
      }

      if (r.error) {
        setDetail(r.error);
      }

      attempts += 1;
      if (attempts > 25) {
        setMessage("Ainda aguardando confirmação");
        setDetail(
          "Se você já pagou, aguarde alguns instantes ou atualize esta página."
        );
        return;
      }

      window.setTimeout(tick, 2000);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator currentStep={2} totalSteps={2} />
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-900">Quase lá</h1>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        {detail && (
          <p className="mt-2 text-xs text-slate-500 max-w-xs mx-auto">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}
