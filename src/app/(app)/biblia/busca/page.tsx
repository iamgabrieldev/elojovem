import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { searchBibleVerses } from "@/lib/bible/api";
import {
  BIBLE_VERSIONS,
  DEFAULT_BIBLE_VERSION,
  type BibleVersionId,
} from "@/lib/bible/constants";
import { BibleSearchForm } from "@/components/features/bible/bible-search-form";

function isVersion(v: string | undefined): v is BibleVersionId {
  return !!v && BIBLE_VERSIONS.some((x) => x.id === v);
}

export default async function BibliaBuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; v?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { q, v } = await searchParams;
  const version = isVersion(v) ? v : DEFAULT_BIBLE_VERSION;
  const query = (q ?? "").trim();

  let results = null as Awaited<ReturnType<typeof searchBibleVerses>> | null;
  let error: string | null = null;

  if (query.length >= 2) {
    try {
      results = await searchBibleVerses(version, query);
    } catch {
      error = "Busca falhou. Tente outro termo ou tente mais tarde.";
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/biblia"
          className="text-xs font-medium text-amber-600 hover:underline w-fit"
        >
          ← Bíblia
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Buscar na Bíblia</h1>
        <p className="text-sm text-slate-500">
          Digite uma palavra ou trecho (mínimo 2 caracteres).
        </p>
      </div>

      <BibleSearchForm initialQuery={query} initialVersion={version} />

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      {results ? (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-slate-500">
            {results.occurrence.toLocaleString("pt-BR")} ocorrências
            (mostrando até {results.verses.length})
          </p>
          <ul className="flex flex-col gap-3">
            {results.verses.slice(0, 40).map((verse, i) => {
              const ab = verse.book.abbrev.pt;
              const href = `/biblia/${version}/${encodeURIComponent(ab)}/${
                verse.chapter
              }`;
              return (
                <li
                  key={`${ab}-${verse.chapter}-${verse.number}-${i}`}
                  className="rounded-xl border border-slate-100 bg-white p-3 text-sm shadow-sm"
                >
                  <Link href={href} className="font-medium text-amber-700">
                    {verse.book.name} {verse.chapter}:{verse.number}
                  </Link>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    {verse.text}
                  </p>
                </li>
              );
            })}
          </ul>
          {results.verses.length > 40 ? (
            <p className="text-xs text-slate-400">
              Refine a busca para ver mais resultados específicos.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
