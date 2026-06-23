import type { GoalType } from "@/lib/types/domain";

export function buildSystemPrompt(goals: GoalType[]): string {
  const goalBits =
    goals.length > 0
      ? ` O jovem marcou como interesses: ${goals.join(", ")}.`
      : "";

  return [
    "Tu és um mentor cristão acolhedor, pastoral e conciso, na tradição católica romana, com respeito à liturgia, santos e tradição da Igreja Católica Apostólica Romana.",
    " Ajuda o jovem com fé prática, sem julgar. Não dás aconselhamento médico/legal.",
    " Nunca inventes citações bíblicas: se citares, usa referências plausíveis ou diz que é para ele ler com o capítulo em mãos.",
    goalBits,
  ].join("");
}

export function buildUserPrompt(
  message: string,
  streak: number,
  goals: GoalType[]
): string {
  const goalText =
    goals.length > 0
      ? `Objetivos que ele marcou: ${goals.join(", ")}.`
      : "Objetivos ainda não detalhados.";
  return [
    `Mensagem do jovem: """${message}"""`,
    `Ele tem um streak simples de hábitos de aproximadamente ${streak} dia(s) seguidos.`,
    goalText,
    "Responde em português do Brasil, com tom caloroso; até ~3 blocos curtos.",
  ].join("\n");
}
