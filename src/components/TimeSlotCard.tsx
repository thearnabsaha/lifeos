"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn, formatHour, getCurrentHour } from "@/lib/utils";

interface TimeSlotCardProps {
  hour: number;
  content: string;
  isToday?: boolean;
  onUpdate: (content: string) => void;
}

export function TimeSlotCard({
  hour,
  content,
  isToday = true,
  onUpdate,
}: TimeSlotCardProps) {
  const [value, setValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentHour = getCurrentHour();
  const isCurrentHour = isToday && hour === currentHour;
  const isPast = isToday ? hour < currentHour : false;

  useEffect(() => {
    setValue(content);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const debouncedSave = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate(text);
      }, 300);
    },
    [onUpdate]
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setValue(text);
    debouncedSave(text);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }

  return (
    <div
      id={`time-slot-${hour}`}
      className={cn(
        "group flex gap-3 rounded-2xl border p-3 transition-all duration-200 animate-fade-in",
        isCurrentHour
          ? "border-accent/40 bg-accent-light/40 shadow-sm ring-2 ring-accent/20 dark:bg-accent/10 dark:border-accent/50"
          : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        isPast && !content && "opacity-50"
      )}
    >
      <div className="flex flex-col items-center pt-1">
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            isCurrentHour
              ? "text-accent font-bold"
              : "text-zinc-400 dark:text-zinc-500"
          )}
        >
          {hour.toString().padStart(2, "0")}
        </span>
        <span className="text-[9px] text-zinc-300 dark:text-zinc-600">
          {formatHour(hour).split(" – ")[1]}
        </span>
        {isCurrentHour && (
          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        )}
      </div>

      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={
            isCurrentHour ? "What are you doing now?" : "What did you do?"
          }
          rows={1}
          className={cn(
            "w-full resize-none overflow-hidden rounded-lg bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none transition-colors",
            "placeholder:text-zinc-300 dark:placeholder:text-zinc-600",
            "focus:bg-zinc-50 dark:focus:bg-zinc-800/50"
          )}
          style={{ minHeight: "2.25rem" }}
        />
      </div>
    </div>
  );
}
