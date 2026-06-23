import { z } from "zod";

import { devotionalAgent } from "@/mastra/agents/devotional-agent";
import type { DevotionalRecord, Tradition } from "@/lib/types/domain";
import {
  devotionalDocId,
  upsertDevotionalRecord,
} from "@/lib/firestore/repos";

const devotionalJsonSchema = z.object({
  summary: z.string().min(20),
  reflection: z.string().min(40),
  prayer: z.string().min(20),
  action: z.string().min(20),
  keyVerse: z.string().min(10),
  keyVerseReference: z.string().min(2),
  promise: z.string().min(10),
  promiseReference: z.string().min(2),
});

export type GeneratedDevotionalPayload = z.infer<typeof devotionalJsonSchema>;

function buildPrompt(isoDate: string) {
  return [
    `Gere o devocional do dia (${isoDate}) para um jovem cristão na tradição católica (Igreja Católica Apostólica Romana).`,
    "",
    "Responda ESTRITAMENTE com um único objeto JSON (sem markdown, sem texto extra) com as chaves:",
    '{"summary","reflection","prayer","action","keyVerse","keyVerseReference","promise","promiseReference"}',
    "",
    "- summary: parágrafo introdutório convidando à reflexão (3-5 frases).",
    "- reflection: texto de reflexão espiritual substantivo.",
    "- prayer: oração em primeira pessoa do plural ou singular, entre aspas ou texto corrido.",
    "- action: passo prático concreto para hoje.",
    "- keyVerse: citação do versículo chave (texto).",
    "- keyVerseReference: referência (ex: João 3:16).",
    "- promise: citação de um versículo de promessa ou encorajamento (pode ser diferente do versículo chave).",
    "- promiseReference: referência bíblica correspondente.",
  ].join("\n");
}

export async function generateAndSaveDevotional(tradition: Tradition, date: Date) {
  const iso = date.toISOString().slice(0, 10);
  const prompt = buildPrompt(iso);

  const result = await devotionalAgent.generate(prompt, {
    structuredOutput: { schema: devotionalJsonSchema },
  });

  if (result.error) {
    console.error("[Devocional AI]", result.error);
    throw result.error;
  }

  const data = result.object;
  if (!data) {
    throw new Error("Resposta do modelo sem objeto estruturado");
  }

  const id = devotionalDocId(tradition, date);
  const record: DevotionalRecord = {
    id,
    tradition,
    date,
    summary: data.summary,
    verse: data.keyVerse,
    verseReference: data.keyVerseReference,
    reflection: data.reflection,
    prayer: data.prayer,
    practicalSteps: data.action,
    promise: data.promise,
    promiseReference: data.promiseReference,
    source: "AI_GENERATED",
  };

  await upsertDevotionalRecord(record);
  return record;
}
