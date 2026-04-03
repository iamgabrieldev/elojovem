"use client";

import { motion } from "framer-motion";

interface StreakAnimationProps {
  streak: number;
}

function getFlameSize(streak: number) {
  if (streak >= 30) return "text-6xl";
  if (streak >= 14) return "text-5xl";
  if (streak >= 7) return "text-4xl";
  if (streak >= 3) return "text-3xl";
  return "text-2xl";
}

function getMotivation(streak: number): string {
  if (streak >= 100) return "LENDÁRIO! Você é uma inspiração!";
  if (streak >= 30) return "Incrível! Um mês inteiro de fidelidade!";
  if (streak >= 14) return "Duas semanas firme! Continue assim!";
  if (streak >= 7) return "Uma semana! Você está em chamas!";
  if (streak >= 3) return "Ótimo começo! Mantenha o ritmo!";
  if (streak >= 1) return "Você já começou — isso já é um passo!";
  return "Comece hoje e construa sua sequência!";
}

export function StreakAnimation({ streak }: StreakAnimationProps) {
  const flameSize = getFlameSize(streak);
  const motivation = getMotivation(streak);

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <motion.div
        className={flameSize}
        animate={{
          scale: [1, 1.15, 1],
          rotate: streak >= 7 ? [0, -3, 3, 0] : 0,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🔥
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-3xl font-bold text-slate-900">
          {streak} <span className="text-lg font-normal text-slate-500">dias</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">{motivation}</p>
      </motion.div>
    </div>
  );
}
