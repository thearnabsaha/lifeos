import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-7", className)} aria-hidden>
      <rect width="64" height="64" rx="14" className="fill-primary" />
      <g className="stroke-primary-foreground" fill="none" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="32" r="17" />
        <path d="M32 22v10l7 5" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>LifeOS</span>
    </span>
  );
}
