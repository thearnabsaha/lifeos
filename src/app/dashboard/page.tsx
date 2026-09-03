"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTimeArenaStore } from "@/store/timeArenaStore";
import { useAuthStore } from "@/store/authStore";
import { TimeSlotCard } from "@/components/TimeSlotCard";
import { DatePicker } from "@/components/DatePicker";
import { Spinner } from "@/components/ui/spinner";
import { getCurrentHour, formatDate } from "@/lib/utils";
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
      }

      try {
        el.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "center",
        });
      } catch {
        // fallback
      }

      return true;
    },
    [isToday, currentHour]
  );

  // Auto-scroll on initial mount when opening the app
  useEffect(() => {
    if (hasScrolledRef.current || entries.length === 0) return;

    // First attempt immediately on render
    const t1 = setTimeout(() => {
      if (scrollToCurrentHour(true)) {
        hasScrolledRef.current = true;
      }
    }, 60);

    // Second attempt once layout and styles are stabilized
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

      setTimeout(() => {
        try {
          nextEl.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {}
      }, 50);
    }
  }, []);

  const filledCount = entries.filter((e) => e.content.trim()).length;

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
            {user?.name ? `Hey, ${user.name}` : "Good day"}
          </h2>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Time Arena
          </h1>
        </div>
        <div className="mt-1">
          {syncing ? (
            <Cloud className="h-4 w-4 animate-pulse text-accent" />
          ) : typeof navigator !== "undefined" && navigator.onLine ? (
            <Cloud className="h-4 w-4 text-emerald-400" />
          ) : (
            <CloudOff className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <DatePicker selectedDate={selectedDate} onDateChange={setDate} />

        <div className="mt-3 flex items-center justify-center gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <div className="text-center">
            <span className="text-lg font-bold text-accent">
              {filledCount}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              /24 logged
            </span>
          </div>
        </div>
      </div>

      {isLoading && entries.every((e) => !e.content) ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6" />
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
