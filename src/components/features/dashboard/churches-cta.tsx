import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export function ChurchesCta() {
  return (
    <Link href="/igrejas">
      <Card className="group flex items-center gap-4 border-sky-200/70 bg-sky-50/60 transition-all hover:-translate-y-0.5 hover:border-sky-300">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <MapPin className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[hsl(var(--fg))]">Igrejas próximas</p>
          <p className="text-xs text-[hsl(var(--muted))]">
            Encontre paróquias e igrejas perto de você
          </p>
        </div>
      </Card>
    </Link>
  );
}

