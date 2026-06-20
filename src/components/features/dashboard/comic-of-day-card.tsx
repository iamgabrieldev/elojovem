"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tradition } from "@/lib/types/domain";
import { EXPANDED_STORIES, MOOD_EMOJIS } from "@/lib/stories";

function hashDateKey(d: Date): number {
  const s = d.toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

type Props = {
  tradition: Tradition | null;
  date: Date;
};

export function ComicOfDayCard({ tradition, date }: Props) {
  const [index, setIndex] = useState(0);

  const story = useMemo(() => {
    const i = hashDateKey(date) % EXPANDED_STORIES.length;
    return EXPANDED_STORIES[i]!;
  }, [date]);

  const panel = story.panels[index] ?? story.panels[0]!;

  // Select emoji based on mood with variety
  const emojiList = MOOD_EMOJIS[panel.mood];
  const emojiIndex = hashDateKey(new Date(date.getTime() + index * 1000)) % emojiList.length;
  const emoji = emojiList[emojiIndex];

  const accent =
    panel.mood === "joy"
      ? "from-amber-100/90 to-orange-50"
      : panel.mood === "hope"
        ? "from-sky-100/80 to-amber-50/80"
        : panel.mood === "calm"
          ? "from-slate-100/90 to-blue-50/60"
          : panel.mood === "love"
            ? "from-rose-100/80 to-pink-50/70"
            : panel.mood === "strength"
              ? "from-orange-100/80 to-red-50/60"
              : panel.mood === "peace"
                ? "from-indigo-100/80 to-purple-50/60"
                : panel.mood === "gratitude"
                  ? "from-yellow-100/80 to-orange-50/60"
                  : "from-emerald-100/80 to-teal-50/60";

  return (
    <Card padding={false} className="overflow-hidden">
      <div
        className={`bg-gradient-to-br ${accent} px-4 py-3 flex items-center gap-2 border-b border-white/40`}
      >
        <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/90">
            HQ do dia
          </p>
          <p className="text-sm font-bold text-slate-900 truncate">
            {story.title}
            {tradition ? (
              <span className="font-normal text-slate-500">
                {" "}
                · {tradition === "CATHOLIC" ? "Caminho católico" : "Caminho protestante"}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="relative min-h-[140px] rounded-2xl border-2 border-dashed border-amber-200/80 bg-white/70 p-5 shadow-inner flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${story.title}-${index}`}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className="text-center w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-5xl mb-3"
                aria-hidden
              >
                {emoji}
              </motion.div>
              <p className="text-sm leading-relaxed text-slate-800 font-medium">
                {panel.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-medium">
            Quadro {index + 1}/{story.panels.length}
          </span>
          <div className="flex gap-2">
            {index > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
              >
                ← Voltar
              </Button>
            ) : null}
            {index < story.panels.length - 1 ? (
              <Button
                type="button"
                size="sm"
                className="text-xs"
                onClick={() =>
                  setIndex((i) => Math.min(story.panels.length - 1, i + 1))
                }
              >
                Próximo →
              </Button>
            ) : null}
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600 text-center leading-relaxed italic font-medium">
          "{story.closing}"
        </p>
        <p className="mt-2 text-[10px] text-slate-500 text-center">
          Tema: {story.theme === "faith" && "Fé"}
          {story.theme === "hope" && "Esperança"}
          {story.theme === "community" && "Comunidade"}
          {story.theme === "resilience" && "Resiliência"}
          {story.theme === "love" && "Amor"}
          {story.theme === "growth" && "Crescimento"}
          {story.theme === "purpose" && "Propósito"}
          {story.theme === "gratitude" && "Gratidão"}
        </p>
      </div>
    </Card>
  );
}
