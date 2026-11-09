"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, Monitor, Download, Loader2, CheckCircle2 } from "lucide-react";
import { McpSection } from "@/components/McpSection";
import { PageHeader, ReceiptCard, ReceiptRow, SectionLabel, Chip, Tear, Barcode } from "@/components/receipt";

const MODE_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Auto", icon: Monitor },
] as const;

const noop = () => () => {};

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
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

  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[680px] px-4 pt-6 pb-6">
      <PageHeader label="LifeOS · Settings" title="Settings" subtitle="Account, appearance, data and AI access." />

      <div className="space-y-8 lr-rise">
        <section>
          <SectionLabel>Account</SectionLabel>
          <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-[0_1px_3px_#0000000d]">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">{initial}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.name || "User"}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </section>

        <section>
          <SectionLabel>Appearance</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {MODE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <Chip key={value} active={mounted && theme === value} onClick={() => setTheme(value)} className="h-9 px-4">
                <Icon className="size-3.5" strokeWidth={1.5} />
                {label}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>Data &amp; export</SectionLabel>
          <div className="rounded-xl border bg-card p-4 shadow-[0_1px_3px_#0000000d]">
            <p className="text-sm text-muted-foreground">
              Download your full Time Arena history as a spreadsheet (.csv). Opens in Excel, Numbers or Sheets.
            </p>
            {exportError && (
              <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{exportError}</p>
            )}
            <Button type="button" variant="outline" onClick={handleExportExcel} disabled={exporting} className="mt-3 h-10 w-full rounded-lg">
              {exporting ? (
                <><Loader2 className="size-4 animate-spin" /> Exporting…</>
              ) : exportSuccess ? (
                <><CheckCircle2 className="size-4 text-success" /> Downloaded</>
              ) : (
                <><Download className="size-4" strokeWidth={1.5} /> Export to CSV</>
              )}
            </Button>
          </div>
        </section>

        <section>
          <SectionLabel>MCP · AI assistant</SectionLabel>
          <McpSection />
        </section>

        <section>
          <SectionLabel>About</SectionLabel>
          <ReceiptCard>
            <div className="flex items-center justify-between">
              <p className="mono-label">LifeOS · Build receipt</p>
              <p className="mono-label">2026</p>
            </div>
            <Tear />
            <ReceiptRow label="Version" value="2.2.0" />
            <ReceiptRow label="Build" value="Production" />
            <ReceiptRow label="Storage" value="Offline-first" />
            <ReceiptRow label="Price" value="$0.00" />
            <Tear />
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-mono font-semibold tabular-nums">Free forever</span>
            </div>
            <Barcode className="mt-4" />
          </ReceiptCard>
        </section>

        <Button variant="outline" className="h-10 w-full rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
          <LogOut className="size-4" strokeWidth={1.5} />
          Sign out
        </Button>
      </div>
    </div>
  );
}
