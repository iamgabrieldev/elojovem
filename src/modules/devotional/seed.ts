import type { Tradition } from "@/lib/types/domain";

/** Mantido para referência; seed via Prisma foi removido com a migração Firebase. */
export const devotionalSeeds: {
  tradition: Tradition;
  date: string;
  summary: string;
  verse: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  practicalSteps: string;
  promise: string;
  promiseReference: string;
}[] = [];
