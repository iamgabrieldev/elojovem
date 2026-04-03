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

export async function fetchDailyLiturgy(
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

    // Hoje a API v2 retorna o dia atual do servidor dela.
    // Mantemos `date` no contrato para futura rota por data e para logging.
    void date;

    return parsed;
  } finally {
    t.clear();
  }
}

