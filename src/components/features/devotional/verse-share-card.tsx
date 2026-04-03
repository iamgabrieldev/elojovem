"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  verse: string | null | undefined;
  verseReference: string | null | undefined;
};

export function VerseShareCard({ verse, verseReference }: Props) {
  const text = useMemo(() => {
    if (!verse || !verseReference) return null;
    return `“${verse}” — ${verseReference}\n\nElo Jovem`;
  }, [verse, verseReference]);

  async function share() {
    if (!text) return;
    if (navigator.share) {
      await navigator.share({ text });
      return;
    }
    await navigator.clipboard.writeText(text);
  }

  if (!verse || !verseReference) return null;

  return (
    <Card className="border-amber-100 bg-[radial-gradient(80%_80%_at_20%_10%,rgba(245,158,11,0.20),transparent_60%),radial-gradient(80%_80%_at_80%_30%,rgba(59,130,246,0.10),transparent_55%),linear-gradient(to_bottom,rgba(255,255,255,0.9),rgba(255,255,255,0.9))]">
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        Versículo para compartilhar
      </p>
      <p className="mt-3 text-base italic text-slate-800 leading-relaxed">
        &ldquo;{verse}&rdquo;
      </p>
      <p className="mt-2 text-sm font-semibold text-amber-700">
        — {verseReference}
      </p>
      <div className="mt-4">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => share().catch(() => null)}
        >
          {typeof navigator !== "undefined" && (navigator as any).share
            ? "Compartilhar"
            : "Copiar"}
        </Button>
      </div>
    </Card>
  );
}

