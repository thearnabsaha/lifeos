"use client";

import { format, addDays, subDays, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DatePicker({ selectedDate, onDateChange }: DatePickerProps) {
  const date = new Date(selectedDate + "T00:00:00");
  const today = isToday(date);

  function goBack() {
    const prev = subDays(date, 1);
    onDateChange(format(prev, "yyyy-MM-dd"));
  }

  function goForward() {
    const next = addDays(date, 1);
    onDateChange(format(next, "yyyy-MM-dd"));
  }

  function goToToday() {
    onDateChange(format(new Date(), "yyyy-MM-dd"));
  }

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={goBack}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={goToToday}
        className="flex flex-col items-center gap-0.5"
      >
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            today
              ? "text-accent"
              : "text-zinc-900 dark:text-white"
          )}
        >
          {today ? "Today" : format(date, "EEE, MMM d")}
        </span>
        {!today && (
          <span className="text-[10px] font-medium text-accent">
            Tap for today
          </span>
        )}
        {today && (
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            {format(date, "MMMM d, yyyy")}
          </span>
        )}
      </button>

      <button
        onClick={goForward}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
