import { Flame, Medal, TimerReset } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { LeaderboardEntry } from "@/lib/types/domain";

function medalTone(position: number) {
  if (position === 1) return "border-yellow-200 bg-yellow-50 text-yellow-700";
  if (position === 2) return "border-slate-200 bg-slate-50 text-slate-700";
  if (position === 3) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-violet-200 bg-violet-50 text-violet-700";
}

export function LeaderboardCard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <Card className="border-violet-200/70 bg-gradient-to-br from-violet-50/80 to-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            Ranking da comunidade
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Mais oração e mais constância
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            O ranking usa os hábitos marcados no app para estimar tempo de oração
            e frequência nos últimos 60 dias.
          </p>
        </div>
        <div className="rounded-2xl bg-violet-100 p-2 text-violet-700">
          <Medal className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-violet-200 bg-white/70 p-4 text-sm text-slate-600">
            Assim que a comunidade registrar orações e hábitos, o ranking aparece aqui.
          </div>
        ) : (
          entries.map((entry, index) => {
            const position = index + 1;
            return (
              <div
                key={entry.userId}
                className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-xs font-bold ${medalTone(position)}`}
                      >
                        #{position}
                      </span>
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {entry.name}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.prayerDays} dias de oração registrados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-violet-700">
                      {entry.estimatedPrayerMinutes} min
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      tempo estimado
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                    <div className="flex items-center gap-1 font-semibold">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      Sequência
                    </div>
                    <p className="mt-1">{entry.currentStreak} dias</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                    <div className="flex items-center gap-1 font-semibold">
                      <TimerReset className="h-3.5 w-3.5 text-emerald-600" />
                      Frequência
                    </div>
                    <p className="mt-1">{entry.activeDays} dias ativos</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700 col-span-2 sm:col-span-1">
                    <p className="font-semibold">Última atividade</p>
                    <p className="mt-1">
                      {entry.lastActiveAt
                        ? entry.lastActiveAt.toLocaleDateString("pt-BR")
                        : "Sem registro"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
