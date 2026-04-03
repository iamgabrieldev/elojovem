import { Card } from "@/components/ui/card";
import type { SaintOfDay } from "@/lib/saints/today";

export function SaintCard({ saint }: { saint: SaintOfDay }) {
  return (
    <Card className="border-amber-100 bg-gradient-to-b from-amber-50/60 to-white">
      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
        Santo do dia
      </p>
      <h2 className="mt-1 text-base font-semibold text-slate-900">
        {saint.title}
      </h2>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        {saint.biography}
      </p>
      <div className="mt-3 rounded-xl bg-white/70 p-3">
        <p className="text-xs font-semibold text-slate-700">Oração</p>
        <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
          {saint.prayer}
        </p>
      </div>
    </Card>
  );
}

