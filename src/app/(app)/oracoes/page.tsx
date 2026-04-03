import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrayerForm } from "@/components/features/prayer/prayer-form";
import { PrayerCard } from "@/components/features/prayer/prayer-card";
import { listPrayers } from "@/lib/firestore/repos";

export default async function OracoesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const prayers = await listPrayers(session.user.id);

  const active = prayers.filter((p) => !p.answered);
  const answered = prayers.filter((p) => p.answered);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pedidos de Oração</h1>
        <p className="text-sm text-slate-500 mt-1">
          Registre suas orações e acompanhe as respostas de Deus.
        </p>
      </div>

      <PrayerForm />

      {active.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-700">
            Ativos ({active.length})
          </p>
          {active.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} />
          ))}
        </div>
      )}

      {answered.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-700">
            Respondidas ({answered.length})
          </p>
          {answered.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} />
          ))}
        </div>
      )}

      {prayers.length === 0 && (
        <div className="flex flex-col items-center py-10 text-center">
          <span className="text-4xl mb-3">🙏</span>
          <p className="text-sm text-slate-500">
            Nenhum pedido ainda. Comece registrando sua primeira oração.
          </p>
        </div>
      )}
    </div>
  );
}
