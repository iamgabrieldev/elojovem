"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { prayers, type MysterySet } from "@/lib/rosary/mysteries";

type Step =
  | { kind: "start"; label: string; text: string }
  | { kind: "mystery"; idx: number; title: string; fruit: string; scripture: string }
  | { kind: "prayer"; label: string; text: string }
  | { kind: "hailMary"; count: number; text: string }
  | { kind: "end"; label: string; text: string };

function buildSteps(set: MysterySet): Step[] {
  const steps: Step[] = [
    { kind: "start", label: "Sinal da Cruz", text: prayers.signOfCross },
    { kind: "prayer", label: "Creio", text: prayers.apostlesCreed },
    { kind: "prayer", label: "Pai Nosso", text: prayers.ourFather },
    { kind: "hailMary", count: 1, text: prayers.hailMary },
    { kind: "hailMary", count: 2, text: prayers.hailMary },
    { kind: "hailMary", count: 3, text: prayers.hailMary },
    { kind: "prayer", label: "Glória", text: prayers.gloryBe },
  ];

  set.mysteries.forEach((m, idx) => {
    steps.push({
      kind: "mystery",
      idx,
      title: m.title,
      fruit: m.fruit,
      scripture: m.scripture,
    });
    steps.push({ kind: "prayer", label: "Pai Nosso", text: prayers.ourFather });
    for (let i = 1; i <= 10; i++) {
      steps.push({ kind: "hailMary", count: i, text: prayers.hailMary });
    }
    steps.push({ kind: "prayer", label: "Glória", text: prayers.gloryBe });
    steps.push({ kind: "prayer", label: "Ó meu Jesus", text: prayers.fatima });
  });

  steps.push({
    kind: "end",
    label: "Salve Rainha",
    text: prayers.hailHolyQueen,
  });
  steps.push({ kind: "end", label: "Sinal da Cruz", text: prayers.signOfCross });
  return steps;
}

function getSpeakText(step: Step): string {
  if (step.kind === "mystery") {
    return `${step.idx + 1}º mistério. ${step.title}. Fruto: ${step.fruit}. Passagem: ${step.scripture}.`;
  }
  if (step.kind === "hailMary") {
    return `Ave Maria, ${step.count} de 10. ${step.text}`;
  }
  return `${step.label}. ${step.text}`;
}

export function RosaryPlayer({ set }: { set: MysterySet }) {
  const steps = useMemo(() => buildSteps(set), [set]);
  const [i, setI] = useState(0);
  const step = steps[i];
  const progress = Math.round(((i + 1) / steps.length) * 100);

  const canPrev = i > 0;
  const canNext = i < steps.length - 1;

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const enabledRef = useRef(false);
  enabledRef.current = audioEnabled;

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  function stopAudio() {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel?.();
    utterRef.current = null;
    setSpeaking(false);
  }

  function speakCurrent() {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) {
      setAudioError("Seu navegador não suporta áudio (TTS) para esta função.");
      setAudioEnabled(false);
      return;
    }
    setAudioError(null);
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(getSpeakText(step));
    u.lang = "pt-BR";
    u.rate = 1;
    u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => {
      setSpeaking(false);
      if (!enabledRef.current) return;
      setI((v) => (v < steps.length - 1 ? v + 1 : v));
    };
    u.onerror = () => {
      setSpeaking(false);
      setAudioError("Não foi possível reproduzir o áudio. Tente novamente.");
    };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  }

  function toggleAudio() {
    const next = !audioEnabled;
    setAudioEnabled(next);
    if (!next) {
      stopAudio();
    } else {
      speakCurrent();
    }
  }

  // Se estiver no modo áudio, fale a próxima etapa ao avançar manualmente.
  useEffect(() => {
    if (!audioEnabled) return;
    // evita re-falar enquanto está speaking por causa do avanço automático
    if (speaking) return;
    speakCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Terço de hoje
          </p>
          <h1 className="text-xl font-bold text-slate-900">
            Mistérios {set.name}
          </h1>
        </div>
        <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {progress}%
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={toggleAudio}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            audioEnabled
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]"
          )}
        >
          Áudio {audioEnabled ? (speaking ? "• tocando" : "• ligado") : "• desligado"}
        </button>

        {audioEnabled ? (
          <button
            type="button"
            onClick={() => (speaking ? stopAudio() : speakCurrent())}
            className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--fg))] hover:bg-[hsl(var(--elev))]"
          >
            {speaking ? "Parar" : "Reproduzir"}
          </button>
        ) : null}
      </div>

      {audioError ? (
        <p className="text-sm text-red-600">{audioError}</p>
      ) : null}

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {step.kind === "mystery" ? (
        <Card className="border-amber-100 bg-gradient-to-b from-amber-50/60 to-white">
          <p className="text-xs font-semibold text-amber-700">
            {step.idx + 1}º mistério
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {step.title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            <span className="font-medium text-slate-800">Fruto:</span>{" "}
            {step.fruit}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-medium text-slate-800">Passagem:</span>{" "}
            {step.scripture}
          </p>
        </Card>
      ) : (
        <Card>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {step.kind === "hailMary" ? `Ave Maria ${step.count}/10` : step.label}
          </p>
          <p className={cn("mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap")}>
            {"text" in step ? step.text : ""}
          </p>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={!canPrev}
          onClick={() => {
            stopAudio();
            setI((v) => Math.max(0, v - 1));
          }}
        >
          Voltar
        </Button>
        <Button
          className="flex-1"
          disabled={!canNext}
          onClick={() => {
            stopAudio();
            setI((v) => Math.min(steps.length - 1, v + 1));
          }}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}

