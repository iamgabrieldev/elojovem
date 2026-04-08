"use client";

import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setRegistrationPaymentEnabledAction } from "@/modules/admin/actions";

export function AdminPaymentToggle({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Pagamento obrigatório</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Desative para liberar acesso gratuito no cadastro enquanto você coleta
            interesse e feedback da landing page.
          </p>
        </div>
        <Badge variant={enabled ? "warning" : "success"}>
          {enabled ? "Ativado" : "Desativado"}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Alternar exigência de pagamento"
          disabled={pending}
          onClick={() => {
            const next = !enabled;
            setError(null);
            startTransition(async () => {
              const result = await setRegistrationPaymentEnabledAction(next);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setEnabled(result.enabled);
            });
          }}
          className={[
            "relative inline-flex h-8 w-14 items-center rounded-full border transition-colors",
            enabled
              ? "border-amber-300 bg-amber-400/80"
              : "border-emerald-300 bg-emerald-500/80",
            pending ? "opacity-70" : "",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform",
              enabled ? "translate-x-7" : "translate-x-1",
            ].join(" ")}
          />
        </button>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          loading={pending}
          onClick={() => {
            const next = !enabled;
            setError(null);
            startTransition(async () => {
              const result = await setRegistrationPaymentEnabledAction(next);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setEnabled(result.enabled);
            });
          }}
        >
          {enabled ? "Liberar acesso gratuito" : "Voltar a cobrar"}
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        Quando desligado, novos cadastros entram sem cobrança e o bloqueio da tela
        de pagamento deixa de ser exigido.
      </p>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
