"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  getQuizByDateKey,
  getQuizAttempt,
  getQuizStreak,
  saveQuizAttempt,
} from "@/lib/firestore/quiz-repos";

function validateAnswers(answers: unknown): answers is number[] {
  if (!Array.isArray(answers) || answers.length !== 5) return false;
  return answers.every(
    (a) => typeof a === "number" && Number.isInteger(a) && a >= 0 && a <= 3
  );
}

export type SubmitQuizResult =
  | { ok: true; score: number; streak: number }
  | { ok: false; error: string };

export async function submitQuizAnswers(
  dateKeyStr: string,
  answers: number[]
): Promise<SubmitQuizResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Faça login para enviar o quiz." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKeyStr)) {
    return { ok: false, error: "Data inválida." };
  }

  if (!validateAnswers(answers)) {
    return { ok: false, error: "Responda todas as 5 perguntas." };
  }

  const existing = await getQuizAttempt(session.user.id, dateKeyStr);
  if (existing) {
    return { ok: false, error: "Você já completou o quiz deste dia." };
  }

  const quiz = await getQuizByDateKey(dateKeyStr);
  if (!quiz || quiz.questions.length !== 5) {
    return { ok: false, error: "Quiz do dia indisponível. Tente mais tarde." };
  }

  let score = 0;
  for (let i = 0; i < 5; i++) {
    if (answers[i] === quiz.questions[i]!.correctIndex) score += 1;
  }

  await saveQuizAttempt(session.user.id, {
    dateKey: dateKeyStr,
    answers,
    score,
  });

  const streak = await getQuizStreak(session.user.id, dateKeyStr);
  revalidatePath("/dashboard");
  revalidatePath("/quiz");

  return { ok: true, score, streak };
}
