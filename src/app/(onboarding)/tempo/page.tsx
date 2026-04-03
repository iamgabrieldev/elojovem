"use client";

import { StepIndicator } from "@/components/features/onboarding/step-indicator";
import { setDailyTime } from "@/modules/user/actions";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const options = [
  { value: 5, label: "5 minutos", desc: "Rápido e objetivo" },
  { value: 10, label: "10 minutos", desc: "Equilíbrio ideal" },
  { value: 20, label: "20 minutos", desc: "Imersão profunda" },
];

export default function TempoPage() {
  return (
    <>
      <StepIndicator currentStep={3} totalSteps={3} />

      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Quanto tempo por dia?
        </h1>
        <p className="text-sm text-slate-500">
          Escolha quanto tempo você pode dedicar diariamente à sua jornada.
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {options.map(({ value, label, desc }) => (
          <button
            key={value}
            onClick={() => setDailyTime(value)}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:border-amber-400 hover:shadow-md active:scale-[0.98]"
            )}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{label}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
