import { unstable_cache } from "next/cache";
import { z } from "zod";
import { devotionalAgent } from "@/mastra/agents/devotional-agent";

const SaintSchema = z.object({
  name: z.string().min(2),
  title: z.string().min(2),
  biography: z.string().min(20),
  prayer: z.string().min(10),
});

export type SaintOfDay = z.infer<typeof SaintSchema>;

async function fetchSaintOfDay(date: Date): Promise<SaintOfDay> {
  const d = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  const prompt =
    "Gere um 'Santo do dia' católico em pt-BR, de forma respeitosa e responsável. " +
    "Se você não tiver certeza histórica, deixe claro que é uma sugestão devocional e evite afirmar fatos específicos. " +
    "Responda SOMENTE JSON válido no seguinte formato: " +
    `{"name":"...","title":"...","biography":"...","prayer":"..."}. ` +
    `Data: ${d}.`;

  const out = await devotionalAgent.generate(prompt);
  const raw = typeof out.text === "string" ? out.text : String(out);
  const json = JSON.parse(raw) as unknown;
  return SaintSchema.parse(json);
}

export function getSaintOfDay(date = new Date()): Promise<SaintOfDay> {
  const dateKey = date.toISOString().slice(0, 10);
  return unstable_cache(
    () => fetchSaintOfDay(date),
    ["saint-of-day", dateKey],
    { revalidate: 86400, tags: ["saint"] }
  )();
}
