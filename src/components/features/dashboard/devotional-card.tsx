import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface DevotionalCardProps {
  verseReference?: string;
  verse?: string;
}

export function DevotionalCard({ verseReference, verse }: DevotionalCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-amber-600">
        <BookOpen className="h-5 w-5" />
        <span className="text-sm font-semibold">Devocional do dia</span>
      </div>

      {verse ? (
        <>
          <p className="text-sm text-slate-600 line-clamp-2 italic">
            &ldquo;{verse.slice(0, 120)}...&rdquo;
          </p>
          <p className="text-xs font-medium text-slate-400">
            {verseReference}
          </p>
          <Link
            href="/devocional"
            className="mt-1 inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            Ler devocional
          </Link>
        </>
      ) : (
        <p className="text-sm text-slate-400">
          Nenhum devocional disponível para hoje.
        </p>
      )}
    </Card>
  );
}
