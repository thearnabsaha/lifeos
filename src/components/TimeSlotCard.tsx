"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { cn, getCurrentHour } from "@/lib/utils";

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
    const next = Math.max(el.scrollHeight, 28);
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
    e.target.style.height = `${Math.max(e.target.scrollHeight, 28)}px`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onUpdate(value);
      onNext?.();
    }
  }

  const filled = value.trim().length > 0;

  return (
    <div
      id={`time-slot-${hour}`}
      onClick={() => textareaRef.current?.focus()}
      className={cn(
        "group relative flex cursor-text touch-manipulation items-start gap-4 px-4 py-2.5 transition-colors duration-150",
        isFocused ? "bg-muted/60" : isCurrentHour ? "bg-muted/40" : "hover:bg-muted/30",
        isPast && !filled && !isFocused && "opacity-60"
      )}
    >
      {isCurrentHour && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-foreground" />}
      {/* Hour column */}
      <div className="flex w-12 shrink-0 select-none flex-col items-start pt-[6px]">
        <span
          className={cn(
            "font-mono text-xs tabular-nums tracking-wider",
            isCurrentHour || isFocused ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {hour.toString().padStart(2, "0")}:00
        </span>
        {isCurrentHour && (
          <span className="mt-1.5 rounded-full bg-primary px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-widest text-primary-foreground">
            Now
          </span>
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
            "text-foreground",
            "placeholder:text-muted-foreground/50",
            "transition-opacity duration-150"
          )}
          style={{ minHeight: "1.75rem" }}
        />
      </div>
      <span
        aria-hidden
        className={cn("mt-[10px] size-1.5 shrink-0 rounded-full transition-colors", filled ? "bg-success" : "bg-transparent")}
      />
    </div>
  );
}
