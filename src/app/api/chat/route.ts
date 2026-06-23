import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { calculateStreak } from "@/modules/habit/streak";
import { buildSystemPrompt, buildUserPrompt } from "@/modules/ai/prompts";
import { mentorAgent } from "@/mastra/agents/mentor-agent";
import { appendChatMessage, getUserProfile } from "@/lib/firestore/repos";

const CHAT_LIMIT = 40;
const CHAT_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const limited = rateLimit(`chat:${userId}`, CHAT_LIMIT, CHAT_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error: "Muitas mensagens. Aguarde um pouco antes de tentar novamente.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil(limited.retryAfterMs / 1000) || 60
          ),
        },
      }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    message?: string;
  } | null;
  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
  }

  const user = await getUserProfile(userId);
  if (!user?.tradition) {
    return NextResponse.json(
      { error: "Onboarding incompleto" },
      { status: 400 }
    );
  }

  const streak = await calculateStreak(userId);

  await appendChatMessage(userId, "user", message, {
    tradition: user.tradition,
    goals: user.goals,
    streak,
  });

  const systemPrompt = buildSystemPrompt(user.goals);
  const userPrompt = buildUserPrompt(message, streak, user.goals);
  const combinedPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

  let fullAssistant = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const output = await mentorAgent.stream(combinedPrompt);
        const reader = output.textStream.getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;

          fullAssistant += value;
          controller.enqueue(encoder.encode(value));
        }

        await appendChatMessage(userId, "assistant", fullAssistant ||
          "Desculpe, não consegui gerar uma resposta completa.", {
          model: "google/gemini-2.5-flash",
        });
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Erro desconhecido";
        console.error("[Mentor AI] Erro no streaming:", errorMsg, err);

        const userFacingMsg =
          "Não consegui responder agora. Tente novamente em alguns instantes.";
        controller.enqueue(encoder.encode(userFacingMsg));

        await appendChatMessage(userId, "assistant", userFacingMsg, {
          error: errorMsg,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
