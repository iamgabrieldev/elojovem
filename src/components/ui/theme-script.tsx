"use client";

import { useEffect } from "react";

type Theme = "system" | "light" | "dark";

export function ThemeScript() {
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("elojovem:theme") as Theme | null;
      const theme: Theme = raw === "light" || raw === "dark" ? raw : "system";
      if (theme === "system") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", theme);
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}

