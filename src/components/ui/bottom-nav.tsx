"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  BookMarked,
  User,
  Trophy,
  BookOpenCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/devocional", label: "Devocional", icon: BookOpen },
    { href: "/quiz", label: "Quiz", icon: BookOpenCheck },
    { href: "/biblia", label: "Bíblia", icon: BookMarked },
    { href: "/ranking", label: "Ranking", icon: Trophy },
    { href: "/perfil", label: "Perfil", icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-stretch justify-start gap-0.5 px-1 py-1.5 sm:justify-around sm:gap-0">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/perfil"
                ? pathname === "/perfil"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                className={cn(
                  "flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-all sm:min-w-[64px] sm:text-[11px]",
                  active
                    ? "bg-amber-500/12 text-amber-600"
                    : "text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
