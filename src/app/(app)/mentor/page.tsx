import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChatHistory } from "@/modules/ai/actions";
import { MentorChat } from "@/components/features/mentor/mentor-chat";

export default async function MentorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const messages = await getChatHistory();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Mentor Espiritual</h1>
        <p className="text-sm text-slate-500 mt-1">
          Converse sobre o que está no seu coração.
        </p>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-col items-center py-10 text-center">
          <span className="text-5xl mb-4">💬</span>
          <p className="text-sm text-slate-500 max-w-xs">
            Olá! Sou seu mentor espiritual. Me conte como você está se sentindo
            ou o que está no seu coração hoje.
          </p>
        </div>
      )}

      <MentorChat
        initialMessages={messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
      />
    </div>
  );
}
