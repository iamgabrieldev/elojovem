import { Agent } from "@mastra/core/agent";

export const mentorAgent = new Agent({
  id: "mentorAgent",
  name: "Mentor Espiritual",
  instructions:
    "Você é um mentor espiritual cristão. Responda sempre em português (pt-BR) com empatia e aplicação prática.",
  model: "google/gemini-2.5-flash",
});
