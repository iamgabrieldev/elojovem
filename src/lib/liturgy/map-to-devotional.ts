import type { DevotionalSource, Tradition } from "@/lib/types/domain";
import type { DailyLiturgy } from "./daily";

export type CatholicDevotionalStructuredContent = {
  kind: "catholic_liturgy_v1";
  liturgy: DailyLiturgy;
  saints: string[];
  worldDays: string[];
  monthlyPrayer: { title: string; prayer: string };
};

function uniq(items: string[]) {
  return Array.from(new Set(items.map((s) => s.trim()).filter(Boolean)));
}

export function inferSaintsFromLiturgyTitle(title: string): string[] {
  const t = title.trim();
  if (!t) return [];

  const matches = t.match(
    /\b(São|Santo|Santa|Santos)\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][^,;()]+/g
  );
  if (matches?.length) return uniq(matches);

  return [t];
}

export function mapCatholicLiturgyToDevotional(params: {
  date: Date;
  tradition: Tradition;
  liturgy: DailyLiturgy;
  saints: string[];
  worldDays: string[];
  monthlyPrayer: { title: string; prayer: string };
}): {
  tradition: Tradition;
  date: Date;
  source: DevotionalSource;
  summary: string;
  verse: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  practicalSteps: string;
  promise: string;
  promiseReference: string;
  structuredContent: CatholicDevotionalStructuredContent;
} {
  const { date, tradition, liturgy, saints, worldDays, monthlyPrayer } =
    params;

  const salmo = liturgy.leituras.salmo[0];
  const evangelho = liturgy.leituras.evangelho[0];
  const primeira = liturgy.leituras.primeiraLeitura[0];

  const summaryParts = [`${liturgy.liturgia} (${liturgy.cor})`];
  if (worldDays.length)
    summaryParts.push(`Hoje também é: ${worldDays.join(" • ")}`);
  if (saints.length)
    summaryParts.push(`Celebração: ${saints.join(" • ")}`);

  return {
    tradition,
    date,
    source: "LITURGICAL",
    summary: summaryParts.join("\n"),
    verse:
      salmo?.refrao?.trim() ||
      salmo?.texto?.split("\n")[0]?.trim() ||
      "",
    verseReference: salmo?.referencia?.trim() || "Salmo do dia",
    reflection:
      evangelho?.texto?.trim() ||
      primeira?.texto?.trim() ||
      "Leituras indisponíveis no momento.",
    prayer: liturgy.oracoes?.coleta?.trim() || "",
    practicalSteps:
      liturgy.antifonas?.entrada?.trim() ||
      "Se puder, participe da Santa Missa hoje e leve um pequeno propósito concreto para viver o Evangelho.",
    promise: "",
    promiseReference: "",
    structuredContent: {
      kind: "catholic_liturgy_v1",
      liturgy,
      saints,
      worldDays,
      monthlyPrayer,
    },
  };
}
