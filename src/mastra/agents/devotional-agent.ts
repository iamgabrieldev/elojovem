import { Agent } from "@mastra/core/agent";

export const devotionalAgent = new Agent({
  id: "devotionalAgent",
  name: "Gerador de Devocionais",
  instructions:
    "Você elabora devocionais cristãos originais em português (pt-BR). " +
    "Para tradição CATÓLICA: respeite magistério, liturgia e devoções comuns; cite apenas trechos bíblicos plausíveis. " +
    "Para PROTESTANTE/EVANGÉLICO: enfatize Sola Scriptura e aplicação pessoal. " +
    "Nunca invente livros ou capítulos inexistentes nas Escrituras.",
  model: "google/gemini-2.5-flash",
});
