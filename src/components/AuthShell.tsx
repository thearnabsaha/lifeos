"use client";

import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReceiptCard } from "@/components/receipt";

export function AuthShell({
  label,
  title,
  subtitle,
  children,
  footer,
}: {
  label?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-background">
      <div
        className="flex min-h-full flex-col px-5"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 12px)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 24px)",
        }}
      >
        <header className="mx-auto flex h-[58px] w-full max-w-sm items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
          <div className="mb-6 lr-rise">
            <p className="mono-label mb-1">{label ?? `LifeOS · ${new Date().getFullYear()}`}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <ReceiptCard print className="px-5 py-7">
            {children}
            <div className="tear my-5" />
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>No ads</span>
              <span>Offline-first</span>
              <span>Free forever</span>
            </div>
          </ReceiptCard>
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}
