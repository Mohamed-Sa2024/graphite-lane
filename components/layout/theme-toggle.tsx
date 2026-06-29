"use client";

import { Moon, Sun } from "lucide-react";
import { useUI } from "@/store/ui";

export function ThemeToggle() {
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light" : "Switch to dark"}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
