import { Music4 } from "lucide-react";

import { Card } from "@/components/ui/card";

type PsalmOfDay = {
  reference: string;
  refrain: string;
  text: string;
};

export function PsalmOfDayCard({ psalm }: { psalm: PsalmOfDay }) {
  return (
    <Card className="border-sky-200/70 bg-gradient-to-br from-sky-50/90 to-white">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-sky-100 p-2 text-sky-700">
          <Music4 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
            Salmo do dia
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">
            {psalm.reference}
          </h2>
          {psalm.refrain ? (
            <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-medium text-sky-900">
              {psalm.refrain}
            </p>
          ) : null}
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {psalm.text}
          </p>
        </div>
      </div>
    </Card>
  );
}
