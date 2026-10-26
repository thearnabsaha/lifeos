"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useTimeArenaStore } from "@/store/timeArenaStore";
import { useAuthStore } from "@/store/authStore";
import { TimeSlotCard } from "@/components/TimeSlotCard";
import { DatePicker } from "@/components/DatePicker";
import { ProgressRing } from "@/components/ProgressRing";
import { format } from "date-fns";
import { getCurrentHour, formatDate } from "@/lib/utils";
import { Cloud, CloudOff, Sparkles, Flame, Sun, Moon, Sunrise } from "lucide-react";

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

  const hourNow = new Date().getHours();
  const greeting =
    hourNow < 5 ? "Good night" : hourNow < 12 ? "Good morning" : hourNow < 17 ? "Good afternoon" : "Good evening";
  const GreetIcon = hourNow < 5 || hourNow >= 19 ? Moon : hourNow < 12 ? Sunrise : Sun;
  const firstName = user?.name?.split(" ")[0];
  const pastHours = isToday ? currentHour + 1 : 24;
  const pastFilled = entries.filter((e) => e.hour < pastHours && e.content.trim()).length;

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-5 flex items-start justify-between animate-fade-in">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            <GreetIcon className="h-3.5 w-3.5 text-accent" />
            {format(new Date(), "EEEE, MMM d")}
          </p>
          <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-gradient">
            {greeting}{firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
        <div
          className="glass mt-1 flex h-9 w-9 items-center justify-center rounded-full"
          title={syncing ? "Syncing" : "Status"}
        >
          {syncing ? (
            <Cloud className="h-4 w-4 animate-pulse text-accent" />
          ) : typeof navigator !== "undefined" && navigator.onLine ? (
            <Cloud className="h-4 w-4 text-emerald-500" />
          ) : (
            <CloudOff className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </div>

      <div className="glass relative mb-5 overflow-hidden rounded-[28px] p-4 animate-slide-up">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <ProgressRing value={filledCount} max={24} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Time Arena</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-bold text-accent tabular-nums">{filledCount}</span>/24 hours logged
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                <Flame className="h-3 w-3" />
                {pastFilled}/{pastHours} so far
              </span>
              <Link
                href="/dashboard/diary"
                className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent hover:bg-accent/20 active:scale-95 transition-all"
              >
                <Sparkles className="h-3 w-3" />
                AI Diary
              </Link>
            </div>
          </div>
        </div>
        <div className="relative mt-4 border-t border-zinc-900/5 pt-3 dark:border-white/5">
          <DatePicker selectedDate={selectedDate} onDateChange={setDate} />
        </div>
      </div>

      {isLoading && entries.every((e) => !e.content) ? (
        <div className="space-y-2 pb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-[60px] rounded-2xl" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2 pb-6">
          {entries.map((slot) => (
            <div
              key={slot.hour}
              ref={isToday && slot.hour === currentHour ? currentHourRef : undefined}
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
    </div>
  );
}
