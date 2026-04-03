"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StreakBadgesProps {
  streak: number;
}

const milestones = [
  { days: 3, emoji: "🌱", label: "Semente" },
  { days: 7, emoji: "🌿", label: "Broto" },
  { days: 14, emoji: "🌳", label: "Árvore" },
  { days: 30, emoji: "⭐", label: "Estrela" },
  { days: 60, emoji: "💎", label: "Diamante" },
  { days: 100, emoji: "👑", label: "Coroa" },
];

export function StreakBadges({ streak }: StreakBadgesProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-900">Conquistas</p>
      <div className="grid grid-cols-3 gap-3">
        {milestones.map(({ days, emoji, label }, i) => {
          const unlocked = streak >= days;
          return (
            <motion.div
              key={days}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition-colors",
                unlocked
                  ? "border-amber-200 bg-amber-50"
                  : "border-slate-100 bg-slate-50 opacity-50"
              )}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-[10px] font-medium text-slate-700">{label}</span>
              <span className="text-[10px] text-slate-400">{days} dias</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
