import { Agent } from "@mastra/core/agent";

export const quizAgent = new Agent({
  id: "quizAgent",
  name: "Gerador de Quiz Bíblico",
  instructions:
    "Você cria quizzes bíblicos em português (pt-BR) para jovens cristãos, católicos e protestantes. " +
    "As perguntas devem ser baseadas em passagens reais das Escrituras; nunca invente livros, capítulos ou versículos inexistentes. " +
    "Nível acessível, linguagem clara e respeitosa. " +
    "Quando houver contexto sobre a leitura litúrgica ou devocional do dia, alinhe parte das perguntas a esse tema sem ser exclusivo de uma tradição.",
  model: "google/gemini-2.5-flash",
});
