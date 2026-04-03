"use client";

import { Card } from "@/components/ui/card";
import { toggleHabit } from "@/modules/habit/actions";
import type { HabitType } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

const habits: { type: HabitType; label: string; emoji: string }[] = [
  { type: "PRAYER", label: "Oração", emoji: "🙏" },
  { type: "BIBLE_READING", label: "Leitura bíblica", emoji: "📖" },
  { type: "GRATITUDE", label: "Gratidão", emoji: "💛" },
];

interface HabitChecklistProps {
  completed: HabitType[];
}

export function HabitChecklist({ completed }: HabitChecklistProps) {
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-900">Hábitos de hoje</p>
      <div className="flex flex-col gap-2">
        {habits.map(({ type, label, emoji }) => {
          const done = completed.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleHabit(type)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98]",
                done
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-100 bg-white hover:border-slate-200"
              )}
            >
              <span className="text-lg">{emoji}</span>
              <span
                className={cn(
                  "flex-1 text-sm font-medium",
                  done ? "text-emerald-700" : "text-slate-700"
                )}
              >
                {label}
              </span>
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                  done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300"
                )}
              >
                {done && (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
