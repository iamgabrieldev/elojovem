import { getDevotional } from "@/lib/firestore/repos";
import { getQuiz, upsertQuizRecord } from "@/lib/firestore/quiz-repos";

import { buildFallbackQuiz } from "./fallback";
import { generateAndSaveQuiz } from "./generate";

async function buildGospelContext(today: Date): Promise<string> {
  const cath = await getDevotional("CATHOLIC", today);
  if (!cath) return "";
  return `Tradição católica — referência: ${cath.verseReference}. Trecho: ${cath.verse.slice(0, 280)}`;
}

export async function ensureTodayQuiz(today: Date) {
  const existing = await getQuiz(today);
  if (existing && existing.questions.length === 5) {
    return { quiz: existing, generated: false as const };
  }

  let gospelContext = "";
  try {
    gospelContext = await buildGospelContext(today);
  } catch {
    gospelContext = "";
  }

  try {
    const quiz = await generateAndSaveQuiz(
      today,
      gospelContext.trim() || undefined
    );
    return { quiz, generated: true as const };
  } catch (err) {
    const retry = await getQuiz(today);
    if (retry && retry.questions.length === 5) {
      return { quiz: retry, generated: false as const };
    }

    console.warn("[Quiz fallback] Usando quiz local por indisponibilidade da IA.", err);
    const fallbackQuiz = buildFallbackQuiz(today);
    await upsertQuizRecord(fallbackQuiz);
    return { quiz: fallbackQuiz, generated: true as const };
  }
}
