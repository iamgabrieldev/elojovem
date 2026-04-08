import Link from "next/link";
import { ArrowRight, BookOpenCheck, Flame } from "lucide-react";

import { Card } from "@/components/ui/card";

export function QuizHubCard({
  streak,
  completedToday,
}: {
  streak: number;
  completedToday: boolean;
}) {
  return (
    <Card className="border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            Área de quizzes
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Um lugar só para seus quizzes bíblicos
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Abra a central para responder o quiz do dia, acompanhar sua sequência
            e revisar seus últimos resultados.
          </p>
        </div>
        <div className="rounded-2xl bg-violet-100 p-2 text-violet-700">
          <BookOpenCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 font-semibold">
          <Flame className="h-4 w-4 text-amber-500" />
          {streak} dia{streak === 1 ? "" : "s"} seguidos
        </span>
        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
          {completedToday ? "Quiz de hoje respondido" : "Quiz de hoje aguardando você"}
        </span>
      </div>

      <Link
        href="/quiz"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        Abrir central de quizzes
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Card>
  );
}
