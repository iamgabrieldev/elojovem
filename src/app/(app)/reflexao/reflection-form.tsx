"use client";

import { useActionState, useMemo, useState } from "react";
import { saveReflectionAction, type ReflectionState } from "@/modules/reflection/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ratingLabels = ["1", "2", "3", "4", "5"];

export function ReflectionForm() {
  const [state, action, pending] = useActionState<ReflectionState, FormData>(
    saveReflectionAction,
    {}
  );
  const [rating, setRating] = useState(4);
  const success = useMemo(() => state.success, [state.success]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Reflexão do dia</h1>
        <p className="mt-1 text-sm text-slate-500">
          Um check-in rápido para fechar o dia com paz e intenção.
        </p>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <Card className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-900">
            Como foi seu dia espiritualmente?
          </p>
          <div className="flex gap-2">
            {ratingLabels.map((lab, idx) => {
              const val = idx + 1;
              const active = val === rating;
              return (
                <button
                  key={lab}
                  type="button"
                  onClick={() => setRating(val)}
                  className={[
                    "h-10 w-10 rounded-full border text-sm font-semibold transition-colors",
                    active
                      ? "border-amber-300 bg-amber-50 text-amber-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {lab}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="rating" value={rating} />
        </Card>

        <Input
          label="Pelo que você é grato(a) hoje?"
          name="gratitude"
          placeholder="Escreva 1–2 frases…"
          required
        />
        <Input
          label="O que você poderia ter feito melhor?"
          name="improve"
          placeholder="Sem culpa — só honestidade…"
          required
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Opcional</p>
          <p className="mt-1 text-xs text-slate-500">
            Se quiser, registre algo para entregar a Deus.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <Input
              label="Algo que você quer confessar?"
              name="confession"
              placeholder="(opcional)"
              required={false}
            />
            <Input
              label="Intenção de oração para amanhã"
              name="intention"
              placeholder="(opcional)"
              required={false}
            />
          </div>
        </div>

        {state.error ? (
          <p className="text-sm text-red-600 text-center">{state.error}</p>
        ) : null}

        {success ? (
          <p className="text-sm text-emerald-700 text-center font-medium">
            Salvo. Que Deus te dê uma noite em paz.
          </p>
        ) : null}

        <Button type="submit" loading={pending} className="w-full">
          Salvar reflexão
        </Button>
      </form>
    </div>
  );
}

