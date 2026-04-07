"use client";

import { useAuthStore } from "@/store/authStore";
import { useThemeStore, ACCENT_COLORS } from "@/store/themeStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Moon, Sun, Monitor, User, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const MODE_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "Auto", icon: Monitor },
];

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { mode, accent, setMode, setAccent } = useThemeStore();

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <h1 className="mb-6 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Settings
      </h1>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light">
              <User className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {user?.email}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
            Appearance
          </h3>
          <div className="flex gap-2">
            {MODE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all",
                  mode === value
                    ? "border-accent bg-accent-light text-accent"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Accent Color
            </h3>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {ACCENT_COLORS.map(({ value, label, hex }) => (
              <button
                key={value}
                onClick={() => setAccent(value)}
                title={label}
                className={cn(
                  "flex h-10 w-full items-center justify-center rounded-xl border-2 transition-all",
                  accent === value
                    ? "border-zinc-900 dark:border-white scale-110"
                    : "border-transparent hover:scale-105"
                )}
              >
                <div
                  className="h-7 w-7 rounded-full shadow-sm"
                  style={{ backgroundColor: hex }}
                />
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
            About
          </h3>
          <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-mono">2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span className="font-mono">Production</span>
            </div>
          </div>
        </Card>

        <Button
          variant="destructive"
          className="w-full"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
