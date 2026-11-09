"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTimeArenaStore } from "@/store/timeArenaStore";
import { useAuthStore } from "@/store/authStore";
import { TimeSlotCard } from "@/components/TimeSlotCard";
import { DatePicker } from "@/components/DatePicker";
import { PageHeader, ReceiptCard, StatStrip, Tear, Barcode, SectionLabel } from "@/components/receipt";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn, getCurrentHour, formatDate } from "@/lib/utils";
import { Cloud, CloudOff } from "lucide-react";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const {
    selectedDate,
    entries,
    isLoading,
    syncing,
    setDate,
    fetchEntries,
    updateEntry,
  } = useTimeArenaStore();

  const currentHourRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  const prevDateRef = useRef(selectedDate);

  const isToday = selectedDate === formatDate(new Date());
  const currentHour = getCurrentHour();

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Scroll only within the inner container without shifting the window
  const scrollToCurrentHour = useCallback(
    (smooth = true) => {
      if (!isToday) return false;

      const el =
        currentHourRef.current ||
        (typeof document !== "undefined"
          ? (document.getElementById(`time-slot-${currentHour}`) as HTMLDivElement | null)
          : null);

      if (!el) return false;

      const mainContainer = el.closest("main") || document.querySelector("main");
      if (mainContainer) {
        const mainRect = mainContainer.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const relativeTop = elRect.top - mainRect.top + mainContainer.scrollTop;
        const targetTop = Math.max(
          0,
          relativeTop - mainRect.height / 2 + elRect.height / 2
        );

        mainContainer.scrollTo({
          top: targetTop,
          behavior: smooth ? "smooth" : "auto",
        });
        return true;
      }

      return false;
    },
    [isToday, currentHour]
  );

  // Auto-scroll on initial mount when opening the app
  useEffect(() => {
    if (hasScrolledRef.current || entries.length === 0) return;

    const t1 = setTimeout(() => {
      if (scrollToCurrentHour(true)) {
        hasScrolledRef.current = true;
      }
    }, 60);

    const t2 = setTimeout(() => {
      if (!hasScrolledRef.current && scrollToCurrentHour(true)) {
        hasScrolledRef.current = true;
      }
    }, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [entries, scrollToCurrentHour]);

  // When user switches date back to today, scroll to current hour
  useEffect(() => {
    if (prevDateRef.current !== selectedDate) {
      prevDateRef.current = selectedDate;
      if (selectedDate === formatDate(new Date())) {
        setTimeout(() => scrollToCurrentHour(true), 120);
      }
    }
  }, [selectedDate, scrollToCurrentHour]);

  const handleUpdate = useCallback(
    (hour: number) => (content: string) => {
      updateEntry(hour, content);
    },
    [updateEntry]
  );

  // Navigate to the next hour's slot on Enter/Return
  const handleNextSlot = useCallback((hour: number) => {
    const nextHour = (hour + 1) % 24;
    const nextEl = document.getElementById(`time-slot-${nextHour}`);
    if (nextEl) {
      const textarea = nextEl.querySelector("textarea");
      if (textarea) {
        textarea.focus();
        const len = textarea.value.length;
        textarea.setSelectionRange(len, len);
      }

      const mainContainer = nextEl.closest("main") || document.querySelector("main");
      if (mainContainer) {
        const mainRect = mainContainer.getBoundingClientRect();
        const elRect = nextEl.getBoundingClientRect();
        const relativeTop = elRect.top - mainRect.top + mainContainer.scrollTop;
        const targetTop = Math.max(0, relativeTop - mainRect.height / 2 + elRect.height / 2);
        mainContainer.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
      }
    }
  }, []);

  const filledCount = entries.filter((e) => e.content.trim()).length;
  const filledHours = new Set(entries.filter((e) => e.content.trim()).map((e) => e.hour));

  const hourNow = new Date().getHours();
  const greeting =
    hourNow < 5 ? "Good night" : hourNow < 12 ? "Good morning" : hourNow < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0];
  const pastHours = isToday ? currentHour + 1 : 24;
  const pastFilled = entries.filter((e) => e.hour < pastHours && e.content.trim()).length;
  const pct = Math.round((filledCount / 24) * 100);
  let streak = 0;
  for (let h = 0, run = 0; h < 24; h++) {
    run = filledHours.has(h) ? run + 1 : 0;
    streak = Math.max(streak, run);
  }
  const viewDate = new Date(selectedDate + "T00:00:00");
  const online = typeof navigator === "undefined" ? true : navigator.onLine;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-6">
      <PageHeader
        label={format(new Date(), "EEE · MMM d · yyyy")}
        title={<>{greeting}{firstName ? `, ${firstName}` : ""}</>}
        subtitle="One line per hour. That's the whole system."
        action={
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground" aria-live="polite">
            {syncing ? (
              <><Cloud className="size-3.5 animate-pulse" strokeWidth={1.5} /> Syncing</>
            ) : online ? (
              <><span className="size-1.5 rounded-full bg-success" /> Synced</>
            ) : (
              <><CloudOff className="size-3.5" strokeWidth={1.5} /> Offline</>
            )}
          </span>
        }
      />

      <div className="grid gap-6 md:grid-cols-12 md:items-start">
        {/* Today receipt */}
        <div className="md:sticky md:top-6 md:col-span-5">
          <ReceiptCard print>
            <div className="flex items-center justify-between">
              <p className="mono-label">Time Arena · Receipt</p>
              <p className="mono-label tabular-nums">#{format(viewDate, "yyMMdd")}</p>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-5xl font-semibold tracking-tight tabular-nums">
                  {filledCount}
                  <span className="ml-1 text-lg font-normal text-muted-foreground">/24</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">hours logged{isToday ? " today" : ""}</p>
              </div>
              <p className={cn("font-mono text-sm font-semibold tabular-nums", pct > 0 && "text-success")}>{pct}%</p>
            </div>

            {/* 24-cell hour strip */}
            <div className="mt-4 grid grid-cols-24 gap-[3px]" aria-hidden>
              {Array.from({ length: 24 }, (_, h) => (
                <span
                  key={h}
                  className={cn(
                    "h-5 rounded-[3px] bg-muted transition-colors",
                    filledHours.has(h) && "bg-foreground",
                    isToday && h === currentHour && !filledHours.has(h) && "bg-success/70",
                  )}
                />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
            </div>

            <Tear />
            <StatStrip
              items={[
                { label: isToday ? "So far" : "Logged", value: `${pastFilled}/${pastHours}` },
                { label: "Empty", value: 24 - filledCount, suffix: "h" },
                { label: "Streak", value: streak, suffix: "h", tone: streak >= 3 ? "success" : "default" },
              ]}
            />
            <Tear />
            <DatePicker selectedDate={selectedDate} onDateChange={setDate} />
            <Tear className="mb-3" />
            <Barcode />
            <p className="mono-label mt-2 text-center">Thank you · Come again tomorrow</p>
          </ReceiptCard>
        </div>

        {/* Hourly slots */}
        <div className="md:col-span-7">
          <SectionLabel count={filledCount}>{isToday ? "Today" : format(viewDate, "EEE, MMM d")} · Hourly log</SectionLabel>
          {isLoading && entries.every((e) => !e.content) ? (
            <div className="overflow-hidden rounded-xl border bg-card">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-b-0">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 flex-1" style={{ maxWidth: `${80 - i * 5}%` }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card shadow-[0_1px_3px_#0000000d] lr-rise">
              {entries.map((slot) => (
                <div
                  key={slot.hour}
                  ref={isToday && slot.hour === currentHour ? currentHourRef : undefined}
                  className="border-b last:border-b-0"
                >
                  <TimeSlotCard
                    hour={slot.hour}
                    content={slot.content}
                    isToday={isToday}
                    onUpdate={handleUpdate(slot.hour)}
                    onNext={() => handleNextSlot(slot.hour)}
                  />
                </div>
              ))}
            </div>
          )}
          <p className="mono-label mt-3 px-1 pb-6 text-center">Return ↵ jumps to the next hour · saves as you type</p>
        </div>
      </div>
    </div>
  );
}
