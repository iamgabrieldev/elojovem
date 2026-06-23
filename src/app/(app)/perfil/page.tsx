import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/features/dashboard/logout-button";
import { AdminPaymentToggle } from "@/components/features/profile/admin-payment-toggle";
import { UserAvatar } from "@/components/features/profile/user-avatar";
import { ThemeToggle } from "@/components/features/profile/theme-toggle";
import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";
import { getAppSettings, getUserProfile } from "@/lib/firestore/repos";
import {
  formatBrlFromCents,
  getAnnualPlan,
  getMonthlyPlan,
} from "@/lib/plans";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/login");
  const settings = user.isAdmin ? await getAppSettings() : null;

  const goalLabels: Record<string, string> = {
    ANXIETY: "Ansiedade",
    DISCIPLINE: "Disciplina",
    PURPOSE: "Propósito",
    FAITH: "Fé",
    RELATIONSHIPS: "Relacionamentos",
  };

  const avatarSeed = user.id;
  const displayName = user.name?.trim() || "Você";

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col items-center gap-4 py-8 text-center border-amber-100 bg-gradient-to-b from-amber-50/50 to-white">
        <UserAvatar seed={avatarSeed} size={104} />
        <div>
          <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
          <p className="text-sm text-slate-500 mt-1 break-all">{user.email}</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/mentor">
          <Card className="flex flex-col items-center gap-2 py-4 hover:border-amber-200 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <MessageCircle className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-800">
              Mentor IA
            </span>
          </Card>
        </Link>
        <Link href="/oracoes">
          <Card className="flex flex-col items-center gap-2 py-4 hover:border-amber-200 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-800">Orações</span>
          </Card>
        </Link>
      </div>

      <Card className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-800">
          Sua jornada espiritual
        </h2>
        <div>
          <p className="text-sm text-slate-500">Tradição</p>
          <div className="mt-1">
            {user.tradition ? (
              <Badge variant="warning">
                Católica Apostólica Romana
              </Badge>
            ) : (
              <Link
                href="/tradicao"
                className="text-sm font-medium text-amber-600 hover:underline"
              >
                Completar onboarding
              </Link>
            )}
          </div>
        </div>
        {user.subscriptionPlan ? (
          <div>
            <p className="text-sm text-slate-500">Plano</p>
            <p className="font-medium text-slate-900 mt-1">
              {user.subscriptionPlan === "MONTHLY"
                ? `Mensal — ${formatBrlFromCents(getMonthlyPlan().priceCents)}/mês`
                : `Anual — ${getAnnualPlan().priceHint} (total ${formatBrlFromCents(getAnnualPlan().priceCents)})`}
            </p>
          </div>
        ) : null}
        <div>
          <p className="text-sm text-slate-500">Tempo diário sugerido</p>
          <p className="font-medium text-slate-900">
            {user.dailyTime ?? 10} minutos
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Objetivos</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {user.goals.length ? (
              user.goals.map((g) => (
                <Badge key={g}>{goalLabels[g] || g}</Badge>
              ))
            ) : (
              <span className="text-sm text-slate-400">—</span>
            )}
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <ThemeToggle />
      </Card>

      {user.isAdmin && settings ? (
        <Card className="flex flex-col gap-4 border-violet-200 bg-gradient-to-b from-violet-50/70 to-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Painel Admin
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              Controle rápido do lançamento
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sua conta está marcada como administradora e pode controlar a flag
              global de pagamento.
            </p>
          </div>
          <AdminPaymentToggle
            initialEnabled={settings.registrationPaymentEnabled}
          />
          <p className="text-xs text-slate-500">
            Admin reconhecido automaticamente para `jonas@email.com`.
          </p>
        </Card>
      ) : null}

      <LogoutButton />
    </div>
  );
}
