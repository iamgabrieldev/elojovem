"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/features/onboarding/step-indicator";
import { setGoals } from "@/modules/user/actions";
import { Button } from "@/components/ui/button";
import type { GoalType } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

const goals: { value: GoalType; label: string; emoji: string }[] = [
  { value: "ANXIETY", label: "Ansiedade", emoji: "🧘" },
  { value: "DISCIPLINE", label: "Disciplina", emoji: "⚡" },
  { value: "PURPOSE", label: "Propósito", emoji: "🎯" },
  { value: "FAITH", label: "Fé", emoji: "🙏" },
  { value: "RELATIONSHIPS", label: "Relacionamentos", emoji: "❤️" },
];

export default function ObjetivosPage() {
  const [selected, setSelected] = useState<GoalType[]>([]);

  function toggle(goal: GoalType) {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  return (
    <>
      <StepIndicator currentStep={2} totalSteps={3} />

      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          O que você quer trabalhar?
        </h1>
        <p className="text-sm text-slate-500">
          Selecione um ou mais objetivos espirituais.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {goals.map(({ value, label, emoji }) => (
          <button
            key={value}
            onClick={() => toggle(value)}
            className={cn(
              "flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-medium transition-all active:scale-95",
              selected.includes(value)
                ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <Button
          onClick={() => setGoals(selected)}
          disabled={selected.length === 0}
          className="w-full"
        >
          Continuar
        </Button>
      </div>
    </>
  );
}
