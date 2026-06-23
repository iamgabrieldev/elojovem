"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

function applyTheme(theme: Theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

function readStored(): Theme {
  try {
    const raw = localStorage.getItem("elojovem:theme");
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    // localStorage blocked
  }
  return "system";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    setTheme(readStored());
  }, []);

  function choose(t: Theme) {
    setTheme(t);
    applyTheme(t);
    try {
      localStorage.setItem("elojovem:theme", t);
    } catch {
      // ignore
    }
  }

  const LABELS: Record<Theme, string> = {
    system: "Sistema",
    light: "Claro",
    dark: "Escuro",
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-[hsl(var(--fg))]">Tema</p>
      <div className="grid grid-cols-3 gap-2">
        {(["system", "light", "dark"] as const).map((t) => {
          const active = t === theme;
          return (
            <button
              key={t}
              type="button"
              onClick={() => choose(t)}
              className="rounded-xl border px-3 py-2 text-sm font-medium transition-all"
              style={{
                borderColor: active
                  ? "hsl(38 92% 50%)"
                  : "hsl(var(--border))",
                background: active
                  ? "hsl(38 92% 50% / 0.10)"
                  : "hsl(var(--elev))",
                color: active
                  ? "hsl(38 80% 38%)"
                  : "hsl(var(--fg))",
              }}
            >
              {LABELS[t]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
