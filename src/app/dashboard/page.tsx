"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTimeArenaStore } from "@/store/timeArenaStore";
import { useAuthStore } from "@/store/authStore";
import { TimeSlotCard } from "@/components/TimeSlotCard";
import { DatePicker } from "@/components/DatePicker";
import { Spinner } from "@/components/ui/spinner";
import { getCurrentHour } from "@/lib/utils";
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
  const hasScrolled = useRef(false);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (!isLoading && !hasScrolled.current && currentHourRef.current) {
      setTimeout(() => {
        currentHourRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        hasScrolled.current = true;
      }, 100);
    }
  }, [isLoading]);

  const handleUpdate = useCallback(
    (hour: number) => (content: string) => {
      updateEntry(hour, content);
    },
    [updateEntry]
  );

  const currentHour = getCurrentHour();
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
            <Cloud className="h-4 w-4 animate-pulse text-blue-500" />
          ) : navigator.onLine ? (
            <Cloud className="h-4 w-4 text-emerald-400" />
          ) : (
            <CloudOff className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <DatePicker selectedDate={selectedDate} onDateChange={setDate} />

        <div className="mt-3 flex items-center justify-center gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <div className="text-center">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
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
        <div className="space-y-2 pb-4">
          {entries.map((slot) => (
            <div
              key={slot.hour}
              ref={slot.hour === currentHour ? currentHourRef : undefined}
            >
              <TimeSlotCard
                hour={slot.hour}
                content={slot.content}
                onUpdate={handleUpdate(slot.hour)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
