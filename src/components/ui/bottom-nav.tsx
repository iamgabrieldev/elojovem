"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  CheckSquare,
  User,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/devocional", label: "Devocional", icon: BookOpen },
    { href: "/igrejas", label: "Igrejas", icon: MapPin },
    { href: "/habitos", label: "Hábitos", icon: CheckSquare },
    { href: "/perfil", label: "Perfil", icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/perfil"
              ? pathname === "/perfil"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-all sm:text-[11px]",
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
    </nav>
  );
}
