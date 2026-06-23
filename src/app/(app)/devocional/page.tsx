import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DevotionalView } from "@/components/features/devotional/devotional-view";
import { ensureTodayDevotional } from "@/modules/devotional/ensure-today";
import { getUserDevotionalState, getUserProfile } from "@/lib/firestore/repos";

// ISR: Revalidar a cada 1 hora (dados mudam 1x por dia)
export const revalidate = 3600;

export default async function DevocionalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserProfile(session.user.id);
  if (!user?.tradition) redirect("/tradicao");

  let devotional;
  try {
    const ensured = await ensureTodayDevotional(user.tradition);
    devotional = ensured.devotional;
  } catch (e) {
    console.error("[Devocional]", e);
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-4">
        <span className="text-5xl">📖</span>
        <h2 className="text-lg font-semibold text-slate-900">
          Não foi possível gerar o devocional
        </h2>
        <p className="text-sm text-slate-500 max-w-sm">
          Verifique a chave{" "}
          <code className="text-xs bg-slate-100 px-1 rounded">
            GOOGLE_GENERATIVE_AI_API_KEY
          </code>{" "}
          e tente novamente em instantes.
        </p>
      </div>
    );
  }

  const userDevotional = await getUserDevotionalState(
    user.id,
    devotional.id
  );

  return (
    <DevotionalView
      devotional={devotional}
      completed={userDevotional?.completed ?? false}
      saved={userDevotional?.saved ?? false}
    />
  );
}
