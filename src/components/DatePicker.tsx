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

  const btn =
    "flex size-10 items-center justify-center rounded-lg border bg-background text-foreground transition-colors hover:bg-muted active:translate-y-px dark:bg-input/30";

  return (
    <div className="flex items-center justify-between gap-3">
      <button type="button" onClick={goBack} className={btn} aria-label="Previous day">
        <ChevronLeft className="size-4" strokeWidth={1.5} />
      </button>

      <button type="button" onClick={goToToday} className="flex min-w-0 flex-col items-center gap-0.5" aria-label="Jump to today">
        <span className="text-base font-semibold tracking-tight">
          {today ? "Today" : format(date, "EEE, MMM d")}
        </span>
        <span className={cn("font-mono text-[10px] uppercase tracking-widest text-muted-foreground", !today && "text-foreground underline underline-offset-4")}>
          {today ? format(date, "MMMM d, yyyy") : "Back to today →"}
        </span>
      </button>

      <button type="button" onClick={goForward} className={btn} aria-label="Next day">
        <ChevronRight className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
