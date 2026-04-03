import Link from "next/link";

import { BIBLE_VERSIONS, type BibleVersionId } from "@/lib/bible/constants";
import { cn } from "@/lib/utils";

interface VersionSelectProps {
  current: BibleVersionId;
  /** Path template with [version] e.g. /biblia/[version]/gn/1 */
  hrefFor: (version: BibleVersionId) => string;
  className?: string;
}

export function VersionSelect({
  current,
  hrefFor,
  className,
}: VersionSelectProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {BIBLE_VERSIONS.map(({ id, label }) => (
        <Link
          key={id}
          href={hrefFor(id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            id === current
              ? "bg-amber-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
