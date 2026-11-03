"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
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

  // Grow the textarea to fit its full text. The old code measured the
  // height only once when the content prop changed, which on mobile could
  // happen before the final layout width settled: the text was measured
  // as one line, then wrapped to two lines at the real width, and the
  // second line was clipped by overflow-hidden. Re-measure whenever the
  // content changes AND whenever the textarea's width changes (resize,
  // font load, viewport change), so long entries are never cut off.
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.max(el.scrollHeight, 36);
    // Only write when it actually changes, so the ResizeObserver below
    // cannot ping-pong on its own height updates.
    if (Math.abs(el.offsetHeight - next) > 1) {
      el.style.height = `${next}px`;
    }
  }, []);

  useLayoutEffect(() => {
    setValue(content);
    resizeTextarea();
  }, [content, resizeTextarea]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Width changes (rotation, viewport, font swap) re-wrap the text,
    // so re-measure on every box change.
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => resizeTextarea())
        : null;
    observer?.observe(el);
    window.addEventListener("resize", resizeTextarea);
    // Fonts loading after first paint can also re-wrap the text.
    document.fonts?.ready.then(() => resizeTextarea()).catch(() => {});
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resizeTextarea);
    };
  }, [resizeTextarea]);

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
        "group relative flex items-start gap-3 overflow-hidden rounded-2xl border p-3.5 transition-all duration-300 cursor-text touch-manipulation backdrop-blur-xl",
        // Base styling
        "bg-white/75 dark:bg-zinc-900/60",
        // Focus state: clean native card highlight (no inner box flash)
        isFocused
          ? "border-accent/60 ring-4 ring-accent/10 glow scale-[1.01]"
          : isCurrentHour
          ? "border-accent/40 !bg-accent/[0.07] glow"
          : "border-zinc-900/[0.06] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-zinc-900/15 dark:hover:border-white/15",
        isPast && !content && !isFocused && "opacity-55"
      )}
    >
      {(isCurrentHour || isFocused || value.trim()) && (
        <span
          className={cn(
            "absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-all",
            isCurrentHour || isFocused ? "accent-gradient" : "bg-accent/30"
          )}
        />
      )}
      {/* Time column */}
      <div className="flex flex-col items-center pt-0.5 select-none shrink-0 min-w-[2.25rem]">
        <span
          className={cn(
            "font-mono text-[13px] font-semibold tabular-nums tracking-tight",
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
          <span className="mt-1.5 rounded-full bg-accent px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-white">Now</span>
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
