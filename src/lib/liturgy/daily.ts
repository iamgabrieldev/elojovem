import { unstable_cache } from "next/cache";
import { z } from "zod";

const ReadingSchema = z.object({
  referencia: z.string().min(2),
  titulo: z.string().optional().default(""),
  texto: z.string().min(1),
});

const SalmoSchema = z.object({
  referencia: z.string().min(2),
  refrao: z.string().optional().default(""),
  texto: z.string().min(1),
});

const OracoesSchema = z.object({
  coleta: z.string().optional().default(""),
  oferendas: z.string().optional().default(""),
  comunhao: z.string().optional().default(""),
});

const AntifonasSchema = z.object({
  entrada: z.string().optional().default(""),
  comunhao: z.string().optional().default(""),
});

export const DailyLiturgySchema = z.object({
  data: z.string().min(8),
  liturgia: z.string().min(2),
  cor: z.string().min(2),
  oracoes: OracoesSchema.optional().default({
    coleta: "",
    oferendas: "",
    comunhao: "",
  }),
  leituras: z.object({
    primeiraLeitura: z.array(ReadingSchema).optional().default([]),
    salmo: z.array(SalmoSchema).optional().default([]),
    segundaLeitura: z.array(ReadingSchema).optional().default([]),
    evangelho: z.array(ReadingSchema).optional().default([]),
  }),
  antifonas: AntifonasSchema.optional().default({
    entrada: "",
    comunhao: "",
  }),
});

export type DailyLiturgy = z.infer<typeof DailyLiturgySchema>;

function withTimeout(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

async function _fetchDailyLiturgy(
  date: Date,
  opts?: { signal?: AbortSignal; timeoutMs?: number },
): Promise<DailyLiturgy> {
  const base = process.env.LITURGIA_DIARIA_BASE_URL?.trim() || "https://liturgia.up.railway.app";
  const url = new URL("/v2/", base);

  const t = withTimeout(opts?.signal, opts?.timeoutMs ?? 8000);
  try {
    const res = await fetch(url, {
      signal: t.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Liturgia diária: HTTP ${res.status}`);
    }

    const json = (await res.json()) as unknown;
    const parsed = DailyLiturgySchema.parse(json);

    void date;

    return parsed;
  } finally {
    t.clear();
  }
}

export function fetchDailyLiturgy(date: Date): Promise<DailyLiturgy> {
  const dateKey = date.toISOString().slice(0, 10);
  return unstable_cache(
    () => _fetchDailyLiturgy(date),
    ["daily-liturgy", dateKey],
    { revalidate: 3600, tags: ["liturgy"] }
  )();
}

