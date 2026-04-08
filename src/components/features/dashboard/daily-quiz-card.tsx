"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenCheck, CheckCircle2, Sparkles, XCircle } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { QuizAttemptRecord, QuizRecord } from "@/lib/types/domain";
import { submitQuizAnswers } from "@/modules/quiz/actions";
import { cn } from "@/lib/utils";

type Props = {
  dateKey: string;
  quiz: QuizRecord | null;
  attempt: QuizAttemptRecord | null;
  initialStreak: number;
};

export function DailyQuizCard({
  dateKey,
  quiz,
  attempt: initialAttempt,
  initialStreak,
}: Props) {
  const [attempt, setAttempt] = useState(initialAttempt);
  const [streak, setStreak] = useState(initialStreak);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    initialAttempt
      ? [...initialAttempt.answers]
      : [null, null, null, null, null]
  );
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [finishedLocal, setFinishedLocal] = useState(false);

  const isCompleted = Boolean(attempt) || finishedLocal;
  const questions = quiz?.questions ?? [];

  const pickOption = useCallback(
    (idx: number) => {
      if (!quiz || isCompleted || revealed) return;
      const next = [...answers];
      next[qIndex] = idx;
      setAnswers(next);
      setRevealed(true);
      setSubmitError(null);
    },
    [answers, isCompleted, qIndex, quiz, revealed]
  );

  const goNext = useCallback(async () => {
    if (!quiz || isCompleted) return;
    const a = answers[qIndex];
    if (a === null || !revealed) return;

    if (qIndex < 4) {
      setQIndex((i) => i + 1);
      setRevealed(false);
      return;
    }

    const all = answers.map((x, i) => (i === qIndex ? a : x)) as number[];
    setSubmitting(true);
    setSubmitError(null);
    const res = await submitQuizAnswers(dateKey, all);
    setSubmitting(false);
    if (res.ok) {
      setFinishedLocal(true);
      setStreak(res.streak);
      setAttempt({
        id: dateKey,
        userId: "",
        dateKey,
        answers: all,
        score: res.score,
        completedAt: new Date(),
      });
    } else {
      setSubmitError(res.error);
    }
  }, [answers, dateKey, isCompleted, qIndex, quiz, revealed]);

  if (!quiz || questions.length !== 5) {
    return (
      <Card className="border-violet-200/60 bg-gradient-to-br from-violet-50/90 to-white">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-800/90">
              Quiz bíblico do dia
            </p>
            <p className="mt-1 text-sm text-slate-600">
              O quiz de hoje ainda não está disponível. Volte em alguns minutos
              ou confira sua conexão — estamos preparando 5 perguntas especiais
              para você.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (isCompleted && attempt) {
    return (
      <CompletedQuizView
        quiz={quiz}
        attempt={attempt}
        streak={streak}
        dateKey={dateKey}
      />
    );
  }

  const current = questions[qIndex]!;
  const selected = answers[qIndex];
  const correctIdx = current.correctIndex;

  return (
    <Card padding={false} className="overflow-hidden border-violet-200/70">
      <div className="border-b border-violet-100 bg-gradient-to-r from-violet-100/90 to-indigo-50/80 px-4 py-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-600 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-800/90">
            Quiz bíblico do dia
          </p>
          <p className="text-sm font-bold text-slate-900">
            Pergunta {qIndex + 1} de 5
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm font-medium text-slate-900 leading-relaxed">
              {current.question}
            </p>
            <p className="mt-1 text-[11px] text-violet-700/80">
              {current.verseReference}
            </p>

            <ul className="mt-4 space-y-2">
              {current.options.map((opt, idx) => {
                const isSel = selected === idx;
                const showTruth = revealed;
                const isCorrect = idx === correctIdx;
                const isWrongSel = showTruth && isSel && !isCorrect;

                return (
                  <li key={idx}>
                    <button
                      type="button"
                      disabled={revealed || isCompleted}
                      onClick={() => pickOption(idx)}
                      className={cn(
                        "w-full text-left rounded-xl border px-3 py-2.5 text-sm transition-colors",
                        !showTruth &&
                          "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/50",
                        showTruth &&
                          isCorrect &&
                          "border-emerald-400 bg-emerald-50 text-emerald-900",
                        showTruth && isWrongSel && "border-red-300 bg-red-50",
                        showTruth &&
                          !isCorrect &&
                          !isSel &&
                          "border-slate-100 bg-slate-50/80 text-slate-500"
                      )}
                    >
                      <span className="font-semibold text-violet-600 mr-2">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt}
                    </button>
                  </li>
                );
              })}
            </ul>

            {revealed ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm",
                  selected === correctIdx
                    ? "border-emerald-200 bg-emerald-50/80"
                    : "border-amber-200 bg-amber-50/80"
                )}
              >
                {selected === correctIdx ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-slate-900">
                    {selected === correctIdx ? "Muito bem!" : "Quase lá!"}
                  </p>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    {current.explanation}
                  </p>
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {submitError ? (
          <p className="text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-1">
          {qIndex > 0 && !revealed ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                const next = Math.max(0, qIndex - 1);
                setQIndex(next);
                setRevealed(answers[next] !== null);
              }}
            >
              Voltar
            </Button>
          ) : null}
          {revealed ? (
            <Button
              type="button"
              size="sm"
              className="text-xs min-w-[140px]"
              disabled={submitting}
              onClick={goNext}
            >
              {qIndex < 4 ? "Próxima" : submitting ? "Enviando…" : "Finalizar"}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function CompletedQuizView({
  quiz,
  attempt,
  streak,
  dateKey,
}: {
  quiz: QuizRecord;
  attempt: QuizAttemptRecord;
  streak: number;
  dateKey: string;
}) {
  return (
    <Card padding={false} className="overflow-hidden border-emerald-200/70">
      <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-100/90 to-teal-50/80 px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpenCheck className="h-4 w-4 text-emerald-700 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/80">
              Quiz de hoje
            </p>
            <p className="text-sm font-bold text-slate-900 truncate">
              Você já respondeu · {attempt.score}/5 acertos
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="text-[10px] uppercase font-semibold text-emerald-800/70">
            Sequência
          </span>
          <span className="rounded-full bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5">
            {streak} dia{streak === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
        <p className="text-xs text-slate-500">
          Revise as perguntas e as referências bíblicas para fixar o aprendizado.
        </p>
        {quiz.questions.map((q, i) => {
          const userAns = attempt.answers[i] ?? -1;
          const ok = userAns === q.correctIndex;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3"
            >
              <div className="flex items-start gap-2">
                {ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500">
                    Pergunta {i + 1}
                  </p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">
                    {q.question}
                  </p>
                  <p className="text-[11px] text-violet-700 mt-1">
                    {q.verseReference}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {q.explanation}
                  </p>
                  {!ok ? (
                    <p className="text-xs text-slate-500 mt-1">
                      Sua resposta:{" "}
                      <span className="font-medium">
                        {userAns >= 0 && userAns < 4
                          ? q.options[userAns]
                          : "—"}
                      </span>
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          );
        })}
        <p className="text-[10px] text-slate-400 text-center pt-1">
          {dateKey}
        </p>
      </div>
    </Card>
  );
}
