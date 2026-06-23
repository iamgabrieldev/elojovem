import { z } from "zod";

import { quizAgent } from "@/mastra/agents/quiz-agent";
import type { QuizQuestion, QuizRecord } from "@/lib/types/domain";
import { upsertQuizRecord, quizDocId } from "@/lib/firestore/quiz-repos";

const quizQuestionSchema = z.object({
  question: z.string().min(10),
  options: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(20),
  verseReference: z.string().min(2),
});

const quizJsonSchema = z.object({
  questions: z.array(quizQuestionSchema).length(5),
});

function buildPrompt(isoDate: string, gospelContext?: string) {
  const lines = [
    `Gere o quiz bíblico do dia (${isoDate}) com exatamente 5 perguntas de múltipla escolha.`,
    "Público: jovens cristãos católicos. Idioma: português do Brasil.",
    "",
    "Responda ESTRITAMENTE com um único objeto JSON (sem markdown, sem texto extra) com a chave:",
    '{"questions": [ ... 5 objetos ... ]}',
    "",
    "Cada objeto em questions deve ter:",
    '- "question": enunciado claro;',
    '- "options": array com exatamente 4 strings (alternativas);',
    '- "correctIndex": número inteiro 0, 1, 2 ou 3 (índice da alternativa correta);',
    '- "explanation": explicação breve (1-3 frases) com base bíblica;',
    '- "verseReference": referência bíblica principal (ex: Lucas 15,11-32 ou Salmo 23,1).',
    "",
    "Regras: use apenas conteúdo compatível com a Bíblia cristã; não invente versículos.",
  ];

  if (gospelContext && gospelContext.trim().length > 0) {
    lines.push(
      "",
      "Contexto opcional sobre leituras ou devocionais de hoje (use para inspirar pelo menos 2 perguntas, mantendo o quiz universal):",
      gospelContext.trim()
    );
  }

  return lines.join("\n");
}

function extractJsonObject(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

async function requestQuizObject(prompt: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const result = await quizAgent.generate(prompt);

    if (result.error) {
      lastError = result.error;
      const statusCode = (result.error as { statusCode?: number }).statusCode;
      if (statusCode === 503 && attempt === 0) {
        continue;
      }
      console.error("[Quiz AI]", result.error);
      throw result.error;
    }

    try {
      const raw = typeof result.text === "string" ? result.text : String(result);
      const parsedJson = JSON.parse(extractJsonObject(raw)) as unknown;
      return quizJsonSchema.parse(parsedJson);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Nao foi possivel gerar o quiz do dia.");
}

function normalizeQuestions(raw: z.infer<typeof quizJsonSchema>): QuizQuestion[] {
  return raw.questions.map((q) => ({
    question: q.question.trim(),
    options: q.options.map((o) => o.trim()) as [string, string, string, string],
    correctIndex: q.correctIndex,
    explanation: q.explanation.trim(),
    verseReference: q.verseReference.trim(),
  }));
}

export async function generateAndSaveQuiz(date: Date, gospelContext?: string) {
  const iso = date.toISOString().slice(0, 10);
  const prompt = buildPrompt(iso, gospelContext);
  const data = await requestQuizObject(prompt);

  const questions = normalizeQuestions(data);
  const id = quizDocId(date);
  const record: QuizRecord = {
    id,
    date,
    questions,
    source: "AI_GENERATED",
  };

  await upsertQuizRecord(record);
  return record;
}
