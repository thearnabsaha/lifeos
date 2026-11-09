"use client";

import { useNowSeconds } from "./useLanding";
import { cn } from "@/lib/utils";

/**
 * Hero visual: a 24-hour ring that fills up to the visitor's current local hour,
 * with the emerald "now" tick. Same idea as the app icon, drawn larger and live.
 */
const C = 500;
const R = 392;
const W = 46;
const GAP = 3.2;
const rad = (d: number) => ((d - 90) * Math.PI) / 180;
function arc(r: number, a0: number, a1: number) {
  const p = (a: number) => `${(C + r * Math.cos(rad(a))).toFixed(2)} ${(C + r * Math.sin(rad(a))).toFixed(2)}`;
  return `M${p(a0)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)}`;
}
const SEGS = Array.from({ length: 24 }, (_, i) => arc(R, i * 15 + GAP / 2, (i + 1) * 15 - GAP / 2));
const TICKS = Array.from({ length: 96 }, (_, i) => i);

export function LiveRing({ className }: { className?: string }) {
  const secs = useNowSeconds();
  const live = secs > 0;
  const d = new Date(secs * 1000);
  const hour = live ? d.getHours() : -1;
  const min = d.getMinutes();
  const sec = d.getSeconds();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dayPct = live ? Math.floor(((hour * 60 + min) / 1440) * 100) : 0;
  const nowArc = live ? arc(R + 10, hour * 15 + GAP / 2, hour * 15 + GAP / 2 + Math.max(1.2, (15 - GAP) * (min / 60))) : "";
  let tz = "";
  if (live) {
    try {
      tz = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).formatToParts(d).find((p) => p.type === "timeZoneName")?.value ?? "";
    } catch {}
  }

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <svg viewBox="0 0 1000 1000" className="absolute inset-0 size-full overflow-visible" role="img" aria-label={live ? `It is ${pad(hour)}:${pad(min)}. ${hour} of 24 hours have passed today.` : "24-hour ring"}>
        {/* minute ticks */}
        {TICKS.map((i) => {
          const a = rad(i * 3.75);
          const r0 = i % 4 === 0 ? 318 : 326;
          return (
            <line
              key={i}
              x1={C + r0 * Math.cos(a)}
              y1={C + r0 * Math.sin(a)}
              x2={C + 334 * Math.cos(a)}
              y2={C + 334 * Math.sin(a)}
              stroke="currentColor"
              strokeOpacity={i % 4 === 0 ? 0.35 : 0.12}
              strokeWidth={i % 24 === 0 ? 4 : 2}
            />
          );
        })}
        {/* empty track */}
        {SEGS.map((p, i) => (
          <path key={`t${i}`} d={p} fill="none" stroke="currentColor" strokeOpacity={0.09} strokeWidth={W} />
        ))}
        {/* filled hours */}
        {live &&
          SEGS.map((p, i) =>
            i < hour ? (
              <path
                key={`f${i}`}
                d={p}
                fill="none"
                stroke="currentColor"
                strokeWidth={W}
                className="lp-seg"
                style={{ animationDelay: `${120 + i * 45}ms` }}
              />
            ) : null
          )}
        {/* current hour: faint emerald track + minute progress + glow */}
        {live && (
          <g className="lp-now" style={{ animationDelay: `${160 + hour * 45}ms` }}>
            <path d={SEGS[hour]} fill="none" stroke="#00d294" strokeOpacity={0.22} strokeWidth={W} />
            <path d={nowArc} fill="none" stroke="#00d294" strokeWidth={W * 1.55} className="lp-glow" />
          </g>
        )}
        {/* hour labels */}
        {[0, 6, 12, 18].map((h) => {
          const a = rad(h * 15);
          return (
            <text
              key={h}
              x={C + 468 * Math.cos(a)}
              y={C + 468 * Math.sin(a)}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground font-mono"
              style={{ fontSize: 26, letterSpacing: "0.15em" }}
            >
              {pad(h)}
            </text>
          );
        })}
      </svg>

      {/* centre readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="mono-label">{live ? `Your time${tz ? ` · ${tz}` : ""}` : "Your time"}</p>
        <p className="mt-2 font-semibold tracking-tighter tabular-nums text-[clamp(3rem,11vw,5.5rem)] leading-none">
          {live ? (
            <>
              {pad(hour)}
              <span className="lp-blink text-muted-foreground/60">:</span>
              {pad(min)}
            </>
          ) : (
            <span className="text-muted-foreground/30">--:--</span>
          )}
        </p>
        <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">{live ? `:${pad(sec)}` : "\u00a0"}</p>
        <div className="mt-4 flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          {live ? `${dayPct}% of today gone` : "Loading your day"}
        </div>
      </div>
    </div>
  );
}
