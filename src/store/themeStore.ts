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

export const ACCENT_COLORS: { value: AccentColor; label: string; hex: string; darkHex: string }[] = [
  { value: "blue", label: "Blue", hex: "#2563eb", darkHex: "#3b82f6" },
  { value: "purple", label: "Purple", hex: "#7c3aed", darkHex: "#8b5cf6" },
  { value: "green", label: "Green", hex: "#059669", darkHex: "#10b981" },
  { value: "orange", label: "Orange", hex: "#ea580c", darkHex: "#f97316" },
  { value: "pink", label: "Pink", hex: "#db2777", darkHex: "#ec4899" },
  { value: "red", label: "Red", hex: "#dc2626", darkHex: "#ef4444" },
  { value: "teal", label: "Teal", hex: "#0d9488", darkHex: "#14b8a6" },
  { value: "indigo", label: "Indigo", hex: "#4f46e5", darkHex: "#6366f1" },
  { value: "amber", label: "Amber", hex: "#d97706", darkHex: "#f59e0b" },
  { value: "rose", label: "Rose", hex: "#e11d48", darkHex: "#fb7185" },
];

interface ThemeState {
  mode: ThemeMode;
  accent: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  init: () => void;
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
  root.style.setProperty("--accent", color.hex);
  root.style.setProperty("--accent-light", color.hex + "20");
  root.style.setProperty("--accent-dark", color.darkHex);
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "system",
  accent: "blue",

  setMode: (mode) => {
    localStorage.setItem("theme-mode", mode);
    applyMode(mode);
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
    set({ mode: savedMode, accent: savedAccent });
  },
}));
