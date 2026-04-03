"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface VerseBlockProps {
  number: number;
  text: string;
  reference: string;
}

export function VerseBlock({ number, text, reference }: VerseBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const line = `${number} ${text}\n— ${reference}`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex w-full gap-3 rounded-xl border border-transparent px-2 py-2 text-left transition-colors hover:border-amber-100 hover:bg-amber-50/40"
    >
      <span className="shrink-0 text-xs font-semibold text-amber-600 tabular-nums w-6 pt-0.5">
        {number}
      </span>
      <span className="flex-1 text-sm text-slate-700 leading-relaxed">{text}</span>
      <span className="shrink-0 self-start text-amber-600">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 opacity-40" />}
      </span>
    </button>
  );
}
