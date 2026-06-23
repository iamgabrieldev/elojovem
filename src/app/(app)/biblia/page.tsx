import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchBibleBooks } from "@/lib/bible/api";
import { DEFAULT_BIBLE_VERSION } from "@/lib/bible/constants";

// ISR: Revalidar a cada 24 horas (livros raramente mudam)
export const revalidate = 86400;

export default async function BibliaIndexPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let books;
  try {
    books = await fetchBibleBooks();
  } catch {
    return (
      <div className="flex flex-col gap-4 py-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">Bíblia</h1>
        <p className="text-sm text-slate-500">
          Não foi possível carregar os livros. Tente novamente mais tarde ou
          configure <code className="text-xs">ABIBLIA_DIGITAL_TOKEN</code> para
          evitar limite de requisições.
        </p>
      </div>
    );
  }

  const v = DEFAULT_BIBLE_VERSION;
  const oldT = books.filter((b) => b.testament === "VT");
  const newT = books.filter((b) => b.testament === "NT");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-slate-900">Bíblia</h1>
        <p className="text-sm text-slate-500">
          Escolha um livro (versão padrão {v.toUpperCase()}).{" "}
          <Link href="/biblia/busca" className="font-medium text-amber-600">
            Buscar texto
          </Link>
        </p>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          Antigo Testamento
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {oldT.map((b) => (
            <Link
              key={b.abbrev.pt}
              href={`/biblia/${v}/${encodeURIComponent(b.abbrev.pt)}/1`}
              className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm hover:border-amber-200"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          Novo Testamento
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {newT.map((b) => (
            <Link
              key={b.abbrev.pt}
              href={`/biblia/${v}/${encodeURIComponent(b.abbrev.pt)}/1`}
              className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm hover:border-amber-200"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
