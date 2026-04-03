"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

import { BIBLE_VERSIONS, type BibleVersionId } from "@/lib/bible/constants";
import { Button } from "@/components/ui/button";

interface BibleSearchFormProps {
  initialQuery: string;
  initialVersion: BibleVersionId;
}

export function BibleSearchForm({
  initialQuery,
  initialVersion,
}: BibleSearchFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = String(new FormData(form).get("q") ?? "").trim();
    const v = String(new FormData(form).get("v") ?? initialVersion);
    startTransition(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (v) params.set("v", v);
      router.push(`/biblia/busca?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={initialQuery}
          placeholder="Ex.: amor, paz, confiar..."
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm"
        />
        <Button type="submit" disabled={pending} className="shrink-0 rounded-full">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <select
        name="v"
        defaultValue={initialVersion}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        {BIBLE_VERSIONS.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
