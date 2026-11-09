"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHasToken } from "./useLanding";
import { cn } from "@/lib/utils";

const primary =
  "group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-[0_1px_3px_#0000001a] transition-colors hover:bg-primary/80 active:translate-y-px";
const secondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border bg-card px-6 text-sm font-medium transition-colors hover:bg-muted active:translate-y-px dark:bg-input/30 dark:hover:bg-input/50";

/** Auth-aware CTA pair. Signed-in visitors get a direct way back to their day. */
export function HeroCtas({ className, center }: { className?: string; center?: boolean }) {
  const authed = useHasToken();
  return (
    <div className={cn("flex flex-wrap items-center gap-3", center && "justify-center", className)}>
      {authed ? (
        <>
          <Link href="/dashboard" className={primary}>
            Open today
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" /> You&apos;re signed in
          </span>
        </>
      ) : (
        <>
          <Link href="/signup" className={primary}>
            Get started free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/login" className={secondary}>
            Log in
          </Link>
        </>
      )}
    </div>
  );
}
