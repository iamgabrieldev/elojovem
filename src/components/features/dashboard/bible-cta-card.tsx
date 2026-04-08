import Link from "next/link";
import { BookMarked } from "lucide-react";
import { Card } from "@/components/ui/card";

export function BibleCtaCard() {
  return (
    <Link href="/biblia" className="block">
      <Card className="flex flex-row items-center gap-4 p-4 transition-all hover:border-amber-200 hover:bg-amber-50/40 active:scale-[0.99]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
          <BookMarked className="h-6 w-6" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Bíblia online</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Leia, busque capítulos e acompanhe sua leitura de hoje.
          </p>
        </div>
        <span className="text-xs font-medium text-amber-700 shrink-0">Abrir</span>
      </Card>
    </Link>
  );
}
