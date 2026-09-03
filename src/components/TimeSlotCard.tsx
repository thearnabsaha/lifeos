"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn, formatHour, getCurrentHour } from "@/lib/utils";

interface TimeSlotCardProps {
  hour: number;
  content: string;
  isToday?: boolean;
  onUpdate: (content: string) => void;
  onNext?: () => void;
}

export function TimeSlotCard({
  hour,
  content,
  isToday = true,
  onUpdate,
  onNext,
}: TimeSlotCardProps) {
  const [value, setValue] = useState(content);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentHour = getCurrentHour();
  const isCurrentHour = isToday && hour === currentHour;
  const isPast = isToday ? hour < currentHour : false;

  useEffect(() => {
    setValue(content);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 36)}px`;
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
    e.target.style.height = `${Math.max(e.target.scrollHeight, 36)}px`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onUpdate(value);
      onNext?.();
    }
  }

  return (
    <div
      id={`time-slot-${hour}`}
      onClick={() => textareaRef.current?.focus()}
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border p-3.5 transition-all duration-200 cursor-text touch-manipulation",
        // Base styling
        "bg-white dark:bg-zinc-900",
        // Focus state: clean native card highlight (no inner box flash)
        isFocused
          ? "border-accent ring-2 ring-accent/20 shadow-md scale-[1.005]"
          : isCurrentHour
          ? "border-accent/40 bg-accent-light/30 dark:bg-accent/10 shadow-sm"
          : "border-zinc-200/70 dark:border-zinc-800/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700",
        isPast && !content && !isFocused && "opacity-55"
      )}
    >
      {/* Time column */}
      <div className="flex flex-col items-center pt-0.5 select-none shrink-0 min-w-[2.25rem]">
        <span
          className={cn(
            "text-xs font-semibold tabular-nums tracking-tight",
            isCurrentHour
              ? "text-accent font-bold"
              : isFocused
              ? "text-zinc-700 dark:text-zinc-200"
              : "text-zinc-400 dark:text-zinc-500"
          )}
        >
          {hour.toString().padStart(2, "0")}
        </span>
        <span className="text-[9px] font-medium text-zinc-300 dark:text-zinc-600">
          {formatHour(hour).split(" – ")[1]}
        </span>
        {isCurrentHour && (
          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        )}
      </div>

      {/* Input area: seamless native feel */}
      <div className="relative flex-1 min-w-0">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            onUpdate(value);
          }}
          enterKeyHint="next"
          autoCapitalize="sentences"
          autoCorrect="on"
          spellCheck={true}
          placeholder={
            isCurrentHour ? "What are you doing now?" : "What did you do?"
          }
          rows={1}
          className={cn(
            // 16px font size on mobile is mandatory to prevent iOS Safari auto-zoom
            "w-full resize-none overflow-hidden bg-transparent p-0 text-[16px] sm:text-[15px] leading-relaxed outline-none border-0 ring-0 focus:outline-none focus:ring-0",
            "text-zinc-900 dark:text-zinc-100",
            "placeholder:text-zinc-300 dark:placeholder:text-zinc-600",
            "transition-opacity duration-150"
          )}
          style={{ minHeight: "2.25rem" }}
        />
      </div>
    </div>
  );
}
