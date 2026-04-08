import Link from "next/link";
import { ExternalLink, Mic, PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { listCuratedForTradition } from "@/lib/curated-media";
import type { Tradition } from "@/lib/types/domain";

type Props = {
  tradition: Tradition | null;
};

function KindIcon({ kind }: { kind: "youtube" | "site" | "audio" }) {
  if (kind === "youtube")
    return <PlayCircle className="h-4 w-4 text-red-600" />;
  if (kind === "audio") return <Mic className="h-4 w-4 text-violet-600" />;
  return <ExternalLink className="h-4 w-4 text-sky-600" />;
}

export function CuratedMediaSection({ tradition }: Props) {
  const items = listCuratedForTradition(tradition);
  if (!items.length) return null;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Vídeos e canais
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Curadoria para inspirar sua caminhada (links externos).
          </p>
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 transition-colors hover:bg-amber-50/60 hover:border-amber-100"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <KindIcon kind={item.kind} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900">
                  {item.title}
                </span>
                <span className="block text-xs text-slate-500 truncate">
                  {item.subtitle}
                </span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
