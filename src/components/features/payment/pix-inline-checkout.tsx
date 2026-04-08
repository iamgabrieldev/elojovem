"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  checkRegistrationPixStatusAction,
  createRegistrationPixQrCodeAction,
} from "@/modules/payment/actions";
import { Button } from "@/components/ui/button";

function formatCountdown(expiresAt?: string) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

type Props = {
  onPaid?: () => void;
  /** Plano cujo valor será usado no QR Code (após salvar CPF/celular). */
  planId: "MONTHLY" | "ANNUAL";
};

export function PixInlineCheckout({ onPaid, planId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<{
    id: string;
    brCode: string;
    brCodeBase64?: string;
    expiresAt?: string;
  } | null>(null);
  const [status, setStatus] = useState<
    "PENDING" | "EXPIRED" | "CANCELLED" | "PAID" | "REFUNDED" | null
  >(null);
  const countdown = useMemo(() => formatCountdown(qr?.expiresAt), [qr?.expiresAt]);
  const polling =
    !!qr?.id &&
    status !== "PAID" &&
    status !== "EXPIRED" &&
    status !== "CANCELLED";

  const create = useCallback(async () => {
    setLoading(true);
    setError(null);
    const r = await createRegistrationPixQrCodeAction(planId);
    if (!r.ok) {
      setLoading(false);
      setError(r.error);
      return;
    }
    setQr(r.qr);
    setStatus("PENDING");
    setLoading(false);
  }, [planId]);

  const copy = useCallback(async () => {
    if (!qr) return;
    try {
      await navigator.clipboard.writeText(qr.brCode);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = qr.brCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
  }, [qr]);

  useEffect(() => {
    if (!qr?.id) return;
    let cancelled = false;

    const tick = async () => {
      const r = await checkRegistrationPixStatusAction();
      if (cancelled) return;
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setStatus(r.status);
      if (r.status === "PAID") {
        onPaid?.();
        return;
      }
      if (r.status === "EXPIRED" || r.status === "CANCELLED") {
        return;
      }
      window.setTimeout(tick, 2500);
    };

    tick();
    return () => {
      cancelled = true;
    };
  }, [qr?.id, onPaid]);

  return (
    <div className="flex flex-col gap-4">
      {!qr ? (
        <Button onClick={create} loading={loading} className="w-full">
          Gerar QR Code Pix
        </Button>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Pix (QR Code)</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {status === "PAID"
                    ? "Pagamento confirmado."
                    : status === "EXPIRED"
                      ? "Expirado. Gere um novo QR Code."
                      : status === "CANCELLED"
                        ? "Cancelado."
                        : "Aguardando pagamento…"}
                </p>
              </div>
              {countdown && status === "PENDING" ? (
                <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {countdown}
                </div>
              ) : null}
            </div>

            {qr.brCodeBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr.brCodeBase64}
                alt="QR Code Pix"
                className="mt-4 mx-auto h-56 w-56 rounded-xl border border-slate-100 bg-white"
              />
            ) : null}

            <div className="mt-4 flex flex-col gap-2">
              <Button variant="secondary" onClick={copy} className="w-full">
                Copiar código Pix
              </Button>
              {(status === "EXPIRED" || status === "CANCELLED") && (
                <Button onClick={create} className="w-full">
                  Gerar novo QR Code
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            {polling ? "Verificando automaticamente…" : "Atualize a página se necessário."}
          </p>
        </>
      )}

      {error ? <p className="text-sm text-red-600 text-center">{error}</p> : null}
    </div>
  );
}

