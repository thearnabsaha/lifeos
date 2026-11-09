import { cn } from "@/lib/utils";

/** Small-size LifeOS mark: rounded square with a 12-step hour ring and the emerald "now" step. */
export function LogoMark({ className }: { className?: string }) {
  const segs = Array.from({ length: 12 }, (_, i) => {
    const a0 = ((i * 30 + 4.5 - 90) * Math.PI) / 180;
    const a1 = (((i + 1) * 30 - 4.5 - 90) * Math.PI) / 180;
    const r = 20.6;
    return {
      d: `M${(32 + r * Math.cos(a0)).toFixed(2)} ${(32 + r * Math.sin(a0)).toFixed(2)}A${r} ${r} 0 0 1 ${(32 + r * Math.cos(a1)).toFixed(2)} ${(32 + r * Math.sin(a1)).toFixed(2)}`,
      i,
    };
  });
  return (
    <svg viewBox="0 0 64 64" className={cn("size-7", className)} aria-hidden>
      <rect width="64" height="64" rx="14.25" className="fill-primary" />
      {segs.map(({ d, i }) =>
        i === 8 ? (
          <path key={i} d={d} fill="none" stroke="#00d294" strokeWidth="9.4" />
        ) : (
          <path key={i} d={d} fill="none" strokeWidth="9.4" className="stroke-primary-foreground" strokeOpacity={i < 8 ? 1 : 0.2} />
        )
      )}
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
