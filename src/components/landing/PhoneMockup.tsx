import { Clock, Bell, Settings } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { cn } from "@/lib/utils";

/** Sample day shown inside the phone. Illustrative only. */
const DAY: Record<number, string> = {
  6: "Run, 5k by the lake",
  7: "Shower, oats, news",
  8: "Commute + podcast",
  9: "Standup, inbox zero",
  10: "Deep work: Q4 plan",
  11: "Deep work: Q4 plan",
  12: "Lunch with Riya",
  13: "Reviewed PRs",
};
const NOW = 14;
const filled = Object.keys(DAY).map(Number);

/** A realistic iPhone frame with the LifeOS Today screen, built in plain HTML/CSS. */
export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-[300px] select-none", className)} aria-label="LifeOS Today screen on an iPhone" role="img">
      {/* frame */}
      <div className="relative rounded-[52px] bg-[#0b0b0b] p-[10px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset] ring-1 ring-black/80 dark:ring-white/10">
        {/* side buttons */}
        <span aria-hidden className="absolute -left-[3px] top-[110px] h-8 w-[3px] rounded-l bg-[#1a1a1a]" />
        <span aria-hidden className="absolute -left-[3px] top-[160px] h-14 w-[3px] rounded-l bg-[#1a1a1a]" />
        <span aria-hidden className="absolute -right-[3px] top-[140px] h-20 w-[3px] rounded-r bg-[#1a1a1a]" />
        {/* screen */}
        <div className="relative h-[610px] overflow-hidden rounded-[42px] bg-background">
          {/* status bar + island */}
          <div className="relative flex h-11 items-center justify-between px-7 pt-1 text-[12px] font-semibold tabular-nums">
            <span>14:07</span>
            <span aria-hidden className="absolute left-1/2 top-2.5 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1">
              <span className="flex items-end gap-[2px]">
                {[4, 6, 8, 10].map((h) => (
                  <span key={h} className="w-[3px] rounded-[1px] bg-foreground" style={{ height: h }} />
                ))}
              </span>
              <span className="ml-1 inline-flex h-[11px] w-[22px] items-center rounded-[3px] border border-foreground/40 p-[1.5px]">
                <span className="h-full w-[70%] rounded-[1.5px] bg-foreground" />
              </span>
            </span>
          </div>
          {/* app header */}
          <div className="flex h-11 items-center justify-between border-b px-4">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold tracking-tight">
              <LogoMark className="size-5" /> LifeOS
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
              <span className="size-1 rounded-full bg-success" /> Synced
            </span>
          </div>

          <div className="px-3.5 pt-3">
            <p className="font-mono text-[8.5px] uppercase tracking-widest text-muted-foreground">Mon · Nov 9 · 2026</p>
            <p className="text-[19px] font-semibold tracking-tight">Good afternoon</p>

            {/* receipt */}
            <div className="mt-2.5 rounded-xl border bg-card px-3 py-3 shadow-[0_1px_3px_#0000000d]">
              <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                <span>Time Arena · Receipt</span>
                <span>#261109</span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-[30px] font-semibold leading-none tracking-tight tabular-nums">
                  8<span className="ml-0.5 text-[12px] font-normal text-muted-foreground">/24</span>
                </p>
                <p className="font-mono text-[11px] font-semibold text-success">33%</p>
              </div>
              <div className="mt-2.5 grid grid-cols-24 gap-[2px]">
                {Array.from({ length: 24 }, (_, h) => (
                  <span
                    key={h}
                    className={cn("h-3 rounded-[2px] bg-muted", filled.includes(h) && "bg-foreground", h === NOW && "bg-success/70")}
                  />
                ))}
              </div>
              <div className="my-2.5 border-t border-dashed" />
              <div className="grid grid-cols-3">
                {[
                  ["So far", "8/15", ""],
                  ["Empty", "16", "h"],
                  ["Streak", "8", "h"],
                ].map(([l, v, s], i) => (
                  <div key={l}>
                    <p className="font-mono text-[7.5px] uppercase tracking-widest text-muted-foreground">{l}</p>
                    <p className={cn("text-[15px] font-semibold tabular-nums", i === 2 && "text-success")}>
                      {v}
                      {s && <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">{s}</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 mb-1.5 px-0.5 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">Today · Hourly log · 08</p>
            <div className="overflow-hidden rounded-xl border bg-card">
              {[10, 11, 12, 13, 14, 15, 16].map((h) => {
                const now = h === NOW;
                const text = DAY[h];
                return (
                  <div key={h} className={cn("relative flex items-start gap-2.5 border-b px-3 py-[7px] last:border-b-0", now && "bg-muted/50")}>
                    {now && <span className="absolute inset-y-0 left-0 w-0.5 bg-foreground" />}
                    <div className="w-9 shrink-0">
                      <span className={cn("font-mono text-[9.5px] tabular-nums", now ? "font-semibold" : "text-muted-foreground")}>
                        {String(h).padStart(2, "0")}:00
                      </span>
                      {now && (
                        <span className="mt-1 block w-fit rounded-full bg-primary px-1 font-mono text-[6.5px] font-semibold uppercase tracking-widest text-primary-foreground">
                          Now
                        </span>
                      )}
                    </div>
                    <span className={cn("flex-1 truncate text-[11.5px] leading-[1.45]", !text && !now && "text-muted-foreground/50")}>
                      {text ?? (now ? (
                        <>
                          Writing the landing page
                          <span className="lp-caret ml-px inline-block h-[12px] w-px translate-y-[2px] bg-foreground" />
                        </>
                      ) : "What did you do?")}
                    </span>
                    <span className={cn("mt-[5px] size-1 shrink-0 rounded-full", text ? "bg-success" : "bg-transparent")} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* bottom nav */}
          <div className="absolute inset-x-0 bottom-0 border-t bg-background pb-4">
            <div className="grid h-12 grid-cols-3">
              {[
                [Clock, "Today", true],
                [Bell, "Reminders", false],
                [Settings, "Settings", false],
              ].map(([Icon, label, active]) => {
                const I = Icon as typeof Clock;
                return (
                  <span key={label as string} className={cn("relative flex flex-col items-center justify-center gap-0.5 text-muted-foreground", active && "text-foreground")}>
                    {active && <span className="absolute inset-x-7 top-0 h-0.5 rounded-full bg-foreground" />}
                    <I className="size-4" strokeWidth={active ? 2 : 1.5} />
                    <span className="font-mono text-[7px] uppercase tracking-widest">{label as string}</span>
                  </span>
                );
              })}
            </div>
            <span aria-hidden className="mx-auto mt-1 block h-1 w-24 rounded-full bg-foreground/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
