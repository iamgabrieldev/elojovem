"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { EXPANDED_STORIES, MOOD_EMOJIS } from "@/lib/stories";

type Mood = "joy" | "calm" | "hope" | "love" | "strength" | "peace" | "gratitude" | "grace";

const MOOD_PALETTE: Record<Mood, { bg: string; border: string; dot: string }> = {
  joy:       { bg: "hsl(38 92% 50% / 0.10)",  border: "hsl(38 92% 55% / 0.45)",  dot: "hsl(38 92% 50%)" },
  hope:      { bg: "hsl(200 80% 55% / 0.10)", border: "hsl(200 80% 55% / 0.40)", dot: "hsl(200 80% 50%)" },
  calm:      { bg: "hsl(220 30% 60% / 0.08)", border: "hsl(220 30% 55% / 0.35)", dot: "hsl(220 30% 55%)" },
  love:      { bg: "hsl(345 80% 55% / 0.10)", border: "hsl(345 80% 55% / 0.40)", dot: "hsl(345 80% 52%)" },
  strength:  { bg: "hsl(20 90% 55% / 0.10)",  border: "hsl(20 90% 55% / 0.40)",  dot: "hsl(20 90% 50%)" },
  peace:     { bg: "hsl(260 70% 55% / 0.08)", border: "hsl(260 70% 55% / 0.35)", dot: "hsl(260 70% 52%)" },
  gratitude: { bg: "hsl(50 85% 50% / 0.10)",  border: "hsl(50 85% 50% / 0.40)",  dot: "hsl(50 85% 46%)" },
  grace:     { bg: "hsl(150 70% 45% / 0.10)", border: "hsl(150 70% 45% / 0.35)", dot: "hsl(150 70% 42%)" },
};

const THEME_LABELS: Record<string, string> = {
  faith: "Fé",
  hope: "Esperança",
  community: "Comunidade",
  resilience: "Resiliência",
  love: "Amor",
  growth: "Crescimento",
  purpose: "Propósito",
  gratitude: "Gratidão",
  grace: "Graça",
};

function hashDate(d: Date, salt = 0): number {
  const s = d.toISOString().slice(0, 10);
  let h = salt;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

type Props = { date: Date };

export function ComicOfDayCard({ date }: Props) {
  const [panelIndex, setPanelIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const story = useMemo(
    () => EXPANDED_STORIES[hashDate(date) % EXPANDED_STORIES.length]!,
    [date]
  );

  const panel = story.panels[panelIndex] ?? story.panels[0]!;
  const mood = panel.mood as Mood;
  const palette = MOOD_PALETTE[mood] ?? MOOD_PALETTE.joy;

  const emojiList = MOOD_EMOJIS[mood] ?? MOOD_EMOJIS.joy;
  const emoji = emojiList[hashDate(date, panelIndex + 1) % emojiList.length];

  const total = story.panels.length;
  const isFirst = panelIndex === 0;
  const isLast = panelIndex === total - 1;

  const panelVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * 24, scale: 0.96 as number }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: d * -24, scale: 0.96 as number }),
  };

  function goTo(next: number) {
    setDirection(next > panelIndex ? 1 : -1);
    setPanelIndex(next);
  }

  return (
    <article
      className="overflow-hidden rounded-2xl border-2 transition-colors duration-300"
      style={{
        borderColor: palette.border,
        background: "hsl(var(--card))",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-2.5 border-b px-4 py-3"
        style={{ background: palette.bg, borderColor: palette.border }}
      >
        <Sparkles
          className="h-4 w-4 shrink-0"
          style={{ color: palette.dot }}
        />
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: palette.dot }}
          >
            HQ do dia
          </p>
          <p
            className="truncate text-sm font-bold"
            style={{ color: "hsl(var(--fg))" }}
          >
            {story.title}
          </p>
        </div>

        {/* Panel counter pill */}
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black"
          style={{
            background: palette.dot,
            color: "hsl(var(--card))",
          }}
        >
          {panelIndex + 1}/{total}
        </span>
      </div>

      {/* ── Comic frame ── */}
      <div className="p-4 pb-3">
        <div
          className="relative overflow-hidden rounded-xl border-2"
          style={{
            borderColor: palette.border,
            background: palette.bg,
            minHeight: 176,
          }}
        >
          {/* Panel number watermark */}
          <span
            className="absolute left-3 top-3 select-none font-black"
            style={{
              fontSize: 10,
              color: palette.dot,
              opacity: 0.45,
              letterSpacing: "0.05em",
            }}
          >
            #{panelIndex + 1}
          </span>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={`${story.title}-${panelIndex}`}
              custom={direction}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex flex-col items-center gap-4 px-5 py-6 text-center"
            >
              {/* Emoji illustration */}
              <motion.span
                initial={{ scale: 0.4, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.06 }}
                className="select-none text-[64px] leading-none"
                aria-hidden
              >
                {emoji}
              </motion.span>

              {/* Speech bubble */}
              <div className="relative w-full">
                {/* Tail pointing up */}
                <div
                  className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l-2 border-t-2"
                  style={{
                    background: "hsl(var(--elev))",
                    borderColor: palette.border,
                  }}
                />
                <div
                  className="rounded-xl border-2 px-4 py-3"
                  style={{
                    background: "hsl(var(--elev))",
                    borderColor: palette.border,
                  }}
                >
                  <p
                    className="text-sm font-semibold leading-relaxed"
                    style={{ color: "hsl(var(--fg))" }}
                  >
                    {panel.text}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Progress dots ── */}
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {story.panels.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === panelIndex ? 20 : 6,
                height: 6,
                background:
                  i === panelIndex ? palette.dot : "hsl(var(--border))",
              }}
              aria-label={`Quadro ${i + 1}`}
            />
          ))}
        </div>

        {/* ── Navigation row ── */}
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goTo(Math.max(0, panelIndex - 1))}
            disabled={isFirst}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-25"
            style={{ color: "hsl(var(--muted))" }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Voltar
          </button>

          <span
            className="text-[10px] font-medium"
            style={{ color: "hsl(var(--muted))" }}
          >
            {THEME_LABELS[story.theme] ?? story.theme}
          </span>

          <button
            type="button"
            onClick={() => goTo(Math.min(total - 1, panelIndex + 1))}
            disabled={isLast}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-25"
            style={{ color: "hsl(var(--fg))" }}
          >
            Avançar
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Closing quote — only on last panel ── */}
        <AnimatePresence>
          {isLast && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              className="mt-4 rounded-xl p-3 text-center"
              style={{ background: palette.bg }}
            >
              <p
                className="text-xs italic leading-relaxed"
                style={{ color: "hsl(var(--fg))", opacity: 0.85 }}
              >
                "{story.closing}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  );
}
