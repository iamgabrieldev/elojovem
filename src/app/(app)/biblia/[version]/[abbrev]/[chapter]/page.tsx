import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchChapter, fetchBook } from "@/lib/bible/api";
import {
  BIBLE_VERSIONS,
  DEFAULT_BIBLE_VERSION,
  type BibleVersionId,
} from "@/lib/bible/constants";
import { VersionSelect } from "@/components/features/bible/version-select";
import { ChapterNav } from "@/components/features/bible/chapter-nav";
import { VerseBlock } from "@/components/features/bible/verse-block";

function isVersion(v: string): v is BibleVersionId {
  return BIBLE_VERSIONS.some((x) => x.id === v);
}

export default async function BibliaChapterPage({
  params,
}: {
  params: Promise<{ version: string; abbrev: string; chapter: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { version: versionParam, abbrev: abbrevParam, chapter: chParam } =
    await params;

  const version = isVersion(versionParam)
    ? versionParam
    : DEFAULT_BIBLE_VERSION;
  const abbrev = decodeURIComponent(abbrevParam);
  const chapter = Number.parseInt(chParam, 10);
  if (!Number.isFinite(chapter) || chapter < 1) notFound();

  let bookMeta;
  let data;
  try {
    [bookMeta, data] = await Promise.all([
      fetchBook(abbrev),
      fetchChapter(version, abbrev, chapter),
    ]);
  } catch {
    notFound();
  }

  const maxChapter = bookMeta.chapters;
  if (chapter > maxChapter) notFound();

  const bookName = data.book.name;
  const hrefVersionSwitch = (v: BibleVersionId) =>
    `/biblia/${v}/${encodeURIComponent(abbrev)}/${chapter}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Link
          href="/biblia"
          className="text-xs font-medium text-amber-600 hover:underline"
        >
          ← Todos os livros
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            {bookName} {chapter}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Toque num versículo para copiar
          </p>
        </div>
        <VersionSelect current={version} hrefFor={hrefVersionSwitch} />
      </div>

      <ChapterNav
        version={version}
        abbrev={abbrev}
        chapter={chapter}
        maxChapter={maxChapter}
      />

      <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        {data.verses.map((verse) => (
          <VerseBlock
            key={verse.number}
            number={verse.number}
            text={verse.text}
            reference={`${bookName} ${chapter}:${verse.number} (${version.toUpperCase()})`}
          />
        ))}
      </div>

      <ChapterNav
        version={version}
        abbrev={abbrev}
        chapter={chapter}
        maxChapter={maxChapter}
      />
    </div>
  );
}
