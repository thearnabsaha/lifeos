import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

export type AccentColor =
  | "blue"
  | "purple"
  | "green"
  | "orange"
  | "pink"
  | "red"
  | "teal"
  | "indigo"
  | "amber"
  | "rose";

export const ACCENT_COLORS: { value: AccentColor; label: string; hex: string; darkHex: string; lightBg: string; darkBg: string }[] = [
  { value: "blue", label: "Blue", hex: "#2563eb", darkHex: "#3b82f6", lightBg: "#dbeafe", darkBg: "#1e3a5f" },
  { value: "purple", label: "Purple", hex: "#7c3aed", darkHex: "#8b5cf6", lightBg: "#ede9fe", darkBg: "#3b1f6e" },
  { value: "green", label: "Green", hex: "#059669", darkHex: "#10b981", lightBg: "#d1fae5", darkBg: "#064e3b" },
  { value: "orange", label: "Orange", hex: "#ea580c", darkHex: "#f97316", lightBg: "#ffedd5", darkBg: "#5c2d0e" },
  { value: "pink", label: "Pink", hex: "#db2777", darkHex: "#ec4899", lightBg: "#fce7f3", darkBg: "#5b1a3a" },
  { value: "red", label: "Red", hex: "#dc2626", darkHex: "#ef4444", lightBg: "#fee2e2", darkBg: "#5c1616" },
  { value: "teal", label: "Teal", hex: "#0d9488", darkHex: "#14b8a6", lightBg: "#ccfbf1", darkBg: "#064e45" },
  { value: "indigo", label: "Indigo", hex: "#4f46e5", darkHex: "#6366f1", lightBg: "#e0e7ff", darkBg: "#2e2b6e" },
  { value: "amber", label: "Amber", hex: "#d97706", darkHex: "#f59e0b", lightBg: "#fef3c7", darkBg: "#5c3a06" },
  { value: "rose", label: "Rose", hex: "#e11d48", darkHex: "#fb7185", lightBg: "#ffe4e6", darkBg: "#5c1626" },
];

interface ThemeState {
  mode: ThemeMode;
  accent: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  init: () => void;
}

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(prefersDark ? "dark" : "light");
  } else {
    root.classList.add(mode);
  }
}

function applyAccent(accent: AccentColor) {
  const color = ACCENT_COLORS.find((c) => c.value === accent);
  if (!color) return;
  const root = document.documentElement;
  const dark = isDark();

  root.style.setProperty("--accent", dark ? color.darkHex : color.hex);
  root.style.setProperty("--accent-light", dark ? color.darkBg : color.lightBg);
  root.style.setProperty("--accent-dark", dark ? color.hex : color.darkHex);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  accent: "blue",

  setMode: (mode) => {
    localStorage.setItem("theme-mode", mode);
    applyMode(mode);
    applyAccent(get().accent);
    set({ mode });
  },

  setAccent: (accent) => {
    localStorage.setItem("theme-accent", accent);
    applyAccent(accent);
    set({ accent });
  },

  init: () => {
    const savedMode = (localStorage.getItem("theme-mode") as ThemeMode) || "system";
    const savedAccent = (localStorage.getItem("theme-accent") as AccentColor) || "blue";
    applyMode(savedMode);
    applyAccent(savedAccent);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", () => {
      if (get().mode === "system") {
        applyMode("system");
        applyAccent(get().accent);
      }
    });

    set({ mode: savedMode, accent: savedAccent });
  },
}));
