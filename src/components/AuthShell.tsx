"use client";

import { Clock } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="app-bg fixed inset-0 overflow-y-auto">
      <div className="orb -left-24 top-10 h-72 w-72 bg-accent" />
      <div className="orb -right-24 bottom-10 h-80 w-80 bg-fuchsia-500/60" style={{ animationDelay: "-6s" }} />
      <div
        className="relative flex min-h-full flex-col items-center justify-center px-6"
        style={{
          paddingTop: "max(env(safe-area-inset-top, 0px), 24px)",
          paddingBottom: "max(env(safe-area-inset-bottom, 0px), 24px)",
        }}
      >
        <div className="w-full max-w-sm stagger">
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-[22px] bg-accent blur-xl opacity-50" />
              <div className="accent-gradient relative flex h-16 w-16 items-center justify-center rounded-[22px] ring-1 ring-white/30">
                <Clock className="h-8 w-8 text-white" strokeWidth={2.25} />
              </div>
            </div>
            <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
              LifeOS
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">{title}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>
          <div className="glass rounded-[28px] p-6">{children}</div>
          <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">{footer}</div>
        </div>
      </div>
    </div>
  );
}
