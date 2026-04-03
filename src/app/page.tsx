import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white px-6 text-center">
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-600 text-3xl text-white shadow-lg">
          ✝
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Elo Jovem</h1>
        <p className="max-w-xs text-slate-500">
          Sua jornada espiritual diária — hábitos, devocionais e um mentor com IA, 
          personalizado para você.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/registro"
          className="inline-flex items-center justify-center rounded-full bg-amber-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
        >
          Começar agora
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
        >
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}
