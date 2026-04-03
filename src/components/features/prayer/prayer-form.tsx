"use client";

import { useActionState, useRef } from "react";
import { createPrayer, type PrayerState } from "@/modules/prayer/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PrayerForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<PrayerState, FormData>(
    async (prev, formData) => {
      const result = await createPrayer(prev, formData);
      if (result.success) formRef.current?.reset();
      return result;
    },
    {}
  );

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3">
      <Input
        name="title"
        placeholder="Pelo que você quer orar?"
        required
      />
      <textarea
        name="description"
        placeholder="Detalhes (opcional)"
        rows={2}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
      />
      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" loading={pending} size="sm">
        Adicionar pedido
      </Button>
    </form>
  );
}
