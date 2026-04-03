import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

export function PrayersCta() {
  return (
    <Link href="/oracoes">
      <Card className="flex items-center gap-4 border-rose-100 bg-rose-50/50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Heart className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">Pedidos de oração</p>
          <p className="text-xs text-slate-500">
            Acompanhe o que você está levando a Deus
          </p>
        </div>
      </Card>
    </Link>
  );
}
