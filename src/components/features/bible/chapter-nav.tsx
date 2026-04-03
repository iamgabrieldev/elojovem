import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { BibleVersionId } from "@/lib/bible/constants";
import { cn } from "@/lib/utils";

interface ChapterNavProps {
  version: BibleVersionId;
  abbrev: string;
  chapter: number;
  maxChapter: number;
  className?: string;
}

export function ChapterNav({
  version,
  abbrev,
  chapter,
  maxChapter,
  className,
}: ChapterNavProps) {
  const base = `/biblia/${version}/${encodeURIComponent(abbrev)}`;
  const prev = chapter > 1 ? `${base}/${chapter - 1}` : null;
  const next = chapter < maxChapter ? `${base}/${chapter + 1}` : null;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {prev ? (
        <Link
          href={prev}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Link>
      ) : (
        <span className="w-24" />
      )}
      {next ? (
        <Link
          href={next}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="w-24" />
      )}
    </div>
  );
}
