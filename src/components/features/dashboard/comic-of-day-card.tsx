"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tradition } from "@/lib/types/domain";

type Panel = { text: string; mood: "joy" | "calm" | "hope" };

type Story = {
  title: string;
  panels: Panel[];
  closing: string;
};

const STORIES: Story[] = [
  {
    title: "O pão partido",
    panels: [
      {
        text: "Jesus olha para a multidão com fome…",
        mood: "calm",
      },
      {
        text: "Um menino oferece pouco — mas é com generosidade.",
        mood: "hope",
      },
      {
        text: "Deus multiplica o que entregamos com amor.",
        mood: "joy",
      },
    ],
    closing: "Fé também pode ser lúdica: pequenos gestos viram milagre.",
  },
  {
    title: "A tempestade acalma",
    panels: [
      {
        text: "O barco balança. O medo cresce.",
        mood: "calm",
      },
      {
        text: "Alguém lembra: “Não estamos sós nesta onda.”",
        mood: "hope",
      },
      {
        text: "A paz não é ausência de vento — é presença de Deus.",
        mood: "joy",
      },
    ],
    closing: "Hoje, respire: a fé cabe em um minuto de silêncio honesto.",
  },
  {
    title: "Caminho de casa",
    panels: [
      {
        text: "Dois amigos conversam no fim do dia.",
        mood: "calm",
      },
      {
        text: "Um pergunta: “Você ainda acredita em milagre?”",
        mood: "hope",
      },
      {
        text: "O outro sorri: “Acredito em consolo, propósito e recomeço.”",
        mood: "joy",
      },
    ],
    closing: "Religião pode ser acolhedora — como uma boa história bem contada.",
  },
];

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
    const i = hashDateKey(date) % STORIES.length;
    return STORIES[i]!;
  }, [date]);

  const panel = story.panels[index] ?? story.panels[0]!;

  const accent =
    panel.mood === "joy"
      ? "from-amber-100/90 to-orange-50"
      : panel.mood === "hope"
        ? "from-sky-100/80 to-amber-50/80"
        : "from-slate-100/90 to-amber-50/60";

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
        <div className="relative min-h-[120px] rounded-2xl border-2 border-dashed border-amber-200/80 bg-white/70 p-4 shadow-inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${story.title}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="text-center"
            >
              <p className="text-3xl mb-2" aria-hidden>
                {panel.mood === "joy"
                  ? "✨"
                  : panel.mood === "hope"
                    ? "🕊️"
                    : "🌿"}
              </p>
              <p className="text-sm leading-relaxed text-slate-800 font-medium">
                {panel.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400">
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
                Voltar
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
                Próximo quadro
              </Button>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-600 text-center leading-relaxed">
          {story.closing}
        </p>
      </div>
    </Card>
  );
}
