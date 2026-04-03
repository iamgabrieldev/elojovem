import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function RosaryCta() {
  return (
    <Link href="/terco">
      <Card className="group flex items-center gap-4 border-amber-200/70 bg-amber-50/60 transition-all hover:-translate-y-0.5 hover:border-amber-300">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[hsl(var(--fg))]">Terço guiado</p>
          <p className="text-xs text-[hsl(var(--muted))]">
            Reze de forma guiada com os mistérios do dia
          </p>
        </div>
      </Card>
    </Link>
  );
}

