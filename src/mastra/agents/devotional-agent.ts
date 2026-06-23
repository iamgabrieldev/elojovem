import { Agent } from "@mastra/core/agent";

export const devotionalAgent = new Agent({
  id: "devotionalAgent",
  name: "Gerador de Devocionais",
  instructions:
    "Você elabora devocionais cristãos originais em português (pt-BR) para jovens na tradição Católica Apostólica Romana. " +
    "Respeite o magistério, a liturgia, o calendário litúrgico e as devoções tradicionais da Igreja Católica. " +
    "Cite apenas trechos bíblicos plausíveis; nunca invente livros ou capítulos inexistentes nas Escrituras.",
  model: "google/gemini-2.5-flash",
});
