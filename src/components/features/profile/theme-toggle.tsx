"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

function apply(theme: Theme) {
  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const raw = window.localStorage.getItem("elojovem:theme") as Theme | null;
      return raw === "light" || raw === "dark" || raw === "system"
        ? raw
        : "system";
    } catch {
      return "system";
    }
  });

  useEffect(() => {
    apply(theme);
  }, [theme]);

  function setAndPersist(t: Theme) {
    setTheme(t);
    apply(t);
    try {
      window.localStorage.setItem("elojovem:theme", t);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-slate-800">Tema</p>
      <div className="grid grid-cols-3 gap-2">
        {(["system", "light", "dark"] as const).map((t) => {
          const active = t === theme;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setAndPersist(t)}
              className={[
                "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {t === "system" ? "Sistema" : t === "light" ? "Claro" : "Escuro"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

