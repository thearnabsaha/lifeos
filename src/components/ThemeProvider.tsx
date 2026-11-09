"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Class-based light/dark via next-themes. storageKey "theme-mode" keeps the
 * value users already picked with the old theme store ("light" | "dark" | "system").
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="theme-mode">
      {children}
    </NextThemesProvider>
  );
}
