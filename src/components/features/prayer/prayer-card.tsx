"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { markPrayerAnswered } from "@/modules/prayer/actions";
import { Check } from "lucide-react";
import type { PrayerRecord } from "@/lib/types/domain";

interface PrayerCardProps {
  prayer: PrayerRecord;
}

export function PrayerCard({ prayer }: PrayerCardProps) {
  return (
    <Card className="flex items-start gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900 text-sm">{prayer.title}</p>
          {prayer.answered && <Badge variant="success">Respondida</Badge>}
        </div>
        {prayer.description && (
          <p className="mt-1 text-xs text-slate-500">{prayer.description}</p>
        )}
        <p className="mt-1 text-[10px] text-slate-400">
          {prayer.createdAt.toLocaleDateString("pt-BR")}
        </p>
      </div>
      {!prayer.answered && (
        <button
          onClick={() => markPrayerAnswered(prayer.id)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
          title="Marcar como respondida"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </Card>
  );
}
