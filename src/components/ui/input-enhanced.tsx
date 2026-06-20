"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
}

export function Input({ 
  label, 
  error, 
  success,
  icon,
  className, 
  id, 
  ...props 
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[hsl(var(--fg))] transition-colors"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            "w-full rounded-xl border-2 bg-[hsl(var(--elev))] px-4 py-2.5 text-base text-[hsl(var(--fg))] placeholder:text-[hsl(var(--muted))] shadow-sm transition-all duration-200",
            "focus:outline-none",
            // Default state
            !error && !success && "border-[hsl(var(--border))] focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/25 focus:ring-offset-1 focus:ring-offset-[hsl(var(--bg))] focus:shadow-md",
            // Error state
            error && "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/25 focus:ring-offset-1 focus:ring-offset-[hsl(var(--bg))]",
            // Success state
            success && !error && "border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25 focus:ring-offset-1 focus:ring-offset-[hsl(var(--bg))]",
            className
          )}
          {...props}
        />
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))] transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      {error && <p className="text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1">{error}</p>}
      {success && !error && <p className="text-xs font-medium text-emerald-600 animate-in fade-in slide-in-from-top-1">✓ Válido</p>}
    </div>
  );
}
