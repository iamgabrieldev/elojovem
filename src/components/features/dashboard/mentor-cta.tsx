import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export function MentorCta() {
  return (
    <Link href="/mentor">
      <Card className="flex items-center gap-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Falar com o Mentor</p>
          <p className="text-xs text-amber-100">
            Converse sobre o que está no seu coração
          </p>
        </div>
      </Card>
    </Link>
  );
}
