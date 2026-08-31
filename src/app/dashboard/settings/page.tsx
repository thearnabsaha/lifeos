"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore, ACCENT_COLORS } from "@/store/themeStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LogOut,
  Moon,
  Sun,
  Monitor,
  User,
  Palette,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const MODE_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "system" as const, label: "Auto", icon: Monitor },
];

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { mode, accent, setMode, setAccent } = useThemeStore();
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState("");

  async function handleExportExcel() {
    try {
      setExporting(true);
      setExportError("");
      setExportSuccess(false);

      const res = await fetch("/api/export");
      if (!res.ok) {
        throw new Error("Failed to generate export");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const today = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `LifeOS_TimeArena_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setExportError(err?.message || "Could not export data. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <h1 className="mb-6 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Settings
      </h1>

      <div className="space-y-4">
        {/* User Card */}
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

        {/* Data & Export Card */}
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              Data & Export
            </h3>
          </div>
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Download your full 24-hour Time Arena history as an Excel spreadsheet (.csv).
          </p>

          {exportError && (
            <div className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {exportError}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleExportExcel}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 border-zinc-200 dark:border-zinc-700 hover:bg-accent-light hover:text-accent hover:border-accent transition-all"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span>Exporting spreadsheet...</span>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Spreadsheet Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export to Excel (.csv)</span>
              </>
            )}
          </Button>
        </Card>

        {/* Appearance Card */}
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

        {/* Accent Color */}
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

        {/* About Card */}
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

        {/* Logout */}
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
