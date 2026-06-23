import { redirect } from "next/navigation";
import { BookOpenCheck, Sparkles, Trophy } from "lucide-react";

import { DailyQuizCard } from "@/components/features/dashboard/daily-quiz-card";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  getQuizAttempt,
  getQuizStreak,
  listRecentQuizAttempts,
} from "@/lib/firestore/quiz-repos";
import { dateKey } from "@/lib/firestore/repos";
import { todayDateOnly } from "@/lib/utils";
import { ensureTodayQuiz } from "@/modules/quiz/ensure-today";

// ISR: Revalidar a cada 30 minutos
export const revalidate = 1800;

export default async function QuizPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayDateOnly();
  const todayKey = dateKey(today);

  const [attempt, recentAttempts] = await Promise.all([
    getQuizAttempt(session.user.id, todayKey),
    listRecentQuizAttempts(session.user.id, 8),
  ]);

  let quiz = null;
  try {
    quiz = (await ensureTodayQuiz(today)).quiz;
  } catch {
    quiz = null;
  }

  const streak = attempt ? await getQuizStreak(session.user.id, todayKey) : 0;
  const bestScore =
    recentAttempts.length > 0
      ? Math.max(...recentAttempts.map((quizAttempt) => quizAttempt.score))
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Quiz Bíblico</h1>
        <p className="mt-1 text-sm text-slate-500">
          Responda o quiz do dia, mantenha sua sequência e revise seus últimos
          resultados.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-violet-200/70 bg-gradient-to-br from-violet-50/90 to-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-100 p-2 text-violet-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                Sequência atual
              </p>
              <p className="text-lg font-bold text-slate-900">
                {streak} dia{streak === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Melhor pontuação
              </p>
              <p className="text-lg font-bold text-slate-900">{bestScore}/5</p>
            </div>
          </div>
        </Card>
        <Card className="border-amber-200/70 bg-gradient-to-br from-amber-50/90 to-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-2 text-amber-700">
              <BookOpenCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Últimos quizzes
              </p>
              <p className="text-lg font-bold text-slate-900">
                {recentAttempts.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <DailyQuizCard
        key={`${todayKey}-${attempt?.completedAt?.toISOString() ?? "new"}`}
        dateKey={todayKey}
        quiz={quiz}
        attempt={attempt}
        initialStreak={streak}
      />

      <Card className="border-slate-200/80">
        <p className="text-sm font-semibold text-slate-900">Histórico recente</p>
        {recentAttempts.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Seus últimos quizzes aparecerão aqui assim que você responder o primeiro.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {recentAttempts.map((quizAttempt) => (
              <div
                key={quizAttempt.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{quizAttempt.dateKey}</p>
                  <p className="text-xs text-slate-500">
                    {quizAttempt.completedAt.toLocaleString("pt-BR")}
                  </p>
                </div>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                  {quizAttempt.score}/5 acertos
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
