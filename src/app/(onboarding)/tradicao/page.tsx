"use client";

import { StepIndicator } from "@/components/features/onboarding/step-indicator";
import { setTradition } from "@/modules/user/actions";
import { Church, BookOpen } from "lucide-react";

export default function TradicaoPage() {
  return (
    <>
      <StepIndicator currentStep={1} totalSteps={3} />

      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Qual é a sua tradição?
        </h1>
        <p className="text-sm text-slate-500">
          Isso nos ajuda a personalizar devocionais e conteúdo para você.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <button
          onClick={() => setTradition("CATHOLIC")}
          className="flex items-center gap-4 rounded-2xl border-2 border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:border-amber-400 hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Church className="h-7 w-7" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Católica</p>
            <p className="text-sm text-slate-500">
              Santos, liturgia, rosário e calendário litúrgico
            </p>
          </div>
        </button>

        <button
          onClick={() => setTradition("PROTESTANT")}
          className="flex items-center gap-4 rounded-2xl border-2 border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:border-amber-400 hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Protestante</p>
            <p className="text-sm text-slate-500">
              Foco bíblico, devocionais e sermões
            </p>
          </div>
        </button>
      </div>
    </>
  );
}
