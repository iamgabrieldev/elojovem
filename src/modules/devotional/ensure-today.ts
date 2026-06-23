import { todayDateOnly } from "@/lib/utils";
import type { Tradition } from "@/lib/types/domain";
import { getDevotional } from "@/lib/firestore/repos";

import { ensureCatholicLiturgicalDevotional } from "./ensure-catholic-liturgical";

export async function ensureTodayDevotional(tradition: Tradition) {
  const today = todayDateOnly();
  const existing = await getDevotional(tradition, today);
  if (existing) return { devotional: existing, generated: false as const };

  try {
    return await ensureCatholicLiturgicalDevotional(today);
  } catch (err) {
    const retry = await getDevotional(tradition, today);
    if (retry) return { devotional: retry, generated: false as const };
    throw err;
  }
}
