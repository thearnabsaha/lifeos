"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn, formatHour, getCurrentHour } from "@/lib/utils";

interface TimeSlotCardProps {
  hour: number;
  content: string;
  onUpdate: (content: string) => void;
}

export function TimeSlotCard({
  hour,
  content,
  onUpdate,
}: TimeSlotCardProps) {
  const [value, setValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentHour = getCurrentHour();
  const isCurrentHour = hour === currentHour;
  const isPast = hour < currentHour;

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
      className={cn(
        "group flex gap-3 rounded-2xl border p-3 transition-all duration-200 animate-fade-in",
        isCurrentHour
          ? "border-blue-200 bg-blue-50/50 shadow-sm shadow-blue-100 dark:border-blue-900 dark:bg-blue-950/30 dark:shadow-blue-950/20"
          : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        isPast && !content && "opacity-50"
      )}
    >
      <div className="flex flex-col items-center pt-1">
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
            isCurrentHour
              ? "text-blue-600 dark:text-blue-400"
              : "text-zinc-400 dark:text-zinc-500"
          )}
        >
          {hour.toString().padStart(2, "0")}
        </span>
        <span className="text-[9px] text-zinc-300 dark:text-zinc-600">
          {formatHour(hour).split(" – ")[1]}
        </span>
        {isCurrentHour && (
          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
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
