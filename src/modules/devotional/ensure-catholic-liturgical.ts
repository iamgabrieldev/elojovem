import { fetchDailyLiturgy } from "@/lib/liturgy/daily";
import {
  inferSaintsFromLiturgyTitle,
  mapCatholicLiturgyToDevotional,
} from "@/lib/liturgy/map-to-devotional";
import { getMonthlyPrayer } from "@/lib/liturgy/monthly-prayer";
import { getWorldDays } from "@/lib/observances/world-days";
import {
  devotionalDocId,
  getDevotional,
  upsertDevotionalRecord,
} from "@/lib/firestore/repos";
import type { DevotionalRecord } from "@/lib/types/domain";

export async function ensureCatholicLiturgicalDevotional(date: Date) {
  const existing = await getDevotional("CATHOLIC", date);
  if (existing?.source === "LITURGICAL") {
    return { devotional: existing, generated: false as const };
  }
  if (existing) {
    return { devotional: existing, generated: false as const };
  }

  const liturgy = await fetchDailyLiturgy(date);
  const saints = inferSaintsFromLiturgyTitle(liturgy.liturgia);
  const worldDays = getWorldDays(date);
  const monthlyPrayer = getMonthlyPrayer(date);

  const mapped = mapCatholicLiturgyToDevotional({
    date,
    tradition: "CATHOLIC",
    liturgy,
    saints,
    worldDays,
    monthlyPrayer,
  });

  const id = devotionalDocId("CATHOLIC", date);
  const record: DevotionalRecord = {
    id,
    tradition: mapped.tradition,
    date: mapped.date,
    source: mapped.source,
    summary: mapped.summary,
    verse: mapped.verse || "—",
    verseReference: mapped.verseReference || "Salmo do dia",
    reflection: mapped.reflection || "—",
    prayer: mapped.prayer,
    practicalSteps: mapped.practicalSteps,
    promise: mapped.promise,
    promiseReference: mapped.promiseReference,
    structuredContent: mapped.structuredContent,
  };

  await upsertDevotionalRecord(record);

  return { devotional: record, generated: true as const };
}
