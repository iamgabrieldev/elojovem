import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export function Card({ padding = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[hsl(var(--card))] shadow-[0_6px_18px_-10px_rgba(0,0,0,0.35)] border border-[hsl(var(--border))] transition-all",
        padding && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-[hsl(var(--fg))]", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-[hsl(var(--muted))] mt-1", className)} {...props}>
      {children}
    </p>
  );
}
