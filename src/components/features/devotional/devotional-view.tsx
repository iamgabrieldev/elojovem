"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  markDevotionalCompleted,
  toggleDevotionalSaved,
} from "@/modules/devotional/actions";
import { BookmarkIcon, Check } from "lucide-react";
import type { Devotional } from "@/lib/types/domain";
import { VerseShareCard } from "@/components/features/devotional/verse-share-card";

interface DevotionalViewProps {
  devotional: Devotional;
  completed: boolean;
  saved: boolean;
}

export function DevotionalView({
  devotional,
  completed,
  saved,
}: DevotionalViewProps) {
  const summary = devotional.summary?.trim();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Badge
          variant={devotional.tradition === "CATHOLIC" ? "warning" : "default"}
        >
          {devotional.tradition === "CATHOLIC" ? "Católico" : "Protestante"}
        </Badge>
        <h1 className="mt-2 text-xl font-bold text-slate-900">
          Devocional do dia
        </h1>
      </div>

      {summary ? (
        <Card>
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </Card>
      ) : null}

      <Card className="border-l-4 border-l-amber-400">
        <h2 className="font-semibold text-slate-900 mb-2 text-sm">
          Versículo chave
        </h2>
        <p className="text-base italic text-slate-700 leading-relaxed">
          &ldquo;{devotional.verse}&rdquo;
        </p>
        <p className="mt-2 text-sm font-semibold text-amber-600">
          — {devotional.verseReference}
        </p>
      </Card>

      <VerseShareCard
        verse={devotional.verse}
        verseReference={devotional.verseReference}
      />

      <Card>
        <h2 className="font-semibold text-slate-900 mb-2">Reflexão</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {devotional.reflection}
        </p>
      </Card>

      {devotional.prayer?.trim() ? (
        <Card>
          <h2 className="font-semibold text-slate-900 mb-2">Oração</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {devotional.prayer}
          </p>
        </Card>
      ) : null}

      <Card>
        <h2 className="font-semibold text-slate-900 mb-2">Ação prática</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {devotional.practicalSteps}
        </p>
      </Card>

      {devotional.promise?.trim() ? (
        <Card className="bg-amber-50/60 border-amber-100">
          <h2 className="font-semibold text-slate-900 mb-2">A promessa</h2>
          <p className="text-sm text-slate-700 leading-relaxed italic">
            &ldquo;{devotional.promise}&rdquo;
          </p>
          {devotional.promiseReference ? (
            <p className="mt-2 text-xs font-medium text-amber-700">
              — {devotional.promiseReference}
            </p>
          ) : null}
        </Card>
      ) : null}

      <div className="flex gap-3">
        <Button
          onClick={() => markDevotionalCompleted(devotional.id)}
          disabled={completed}
          variant={completed ? "secondary" : "primary"}
          className="flex-1"
        >
          <Check className="h-4 w-4" />
          {completed ? "Concluído" : "Marcar concluído"}
        </Button>
        <Button
          onClick={() => toggleDevotionalSaved(devotional.id)}
          variant={saved ? "primary" : "secondary"}
        >
          <BookmarkIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
