"use client";

import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return <div className={cn("size-5 animate-spin rounded-full border-2 border-muted border-t-foreground", className)} />;
}
