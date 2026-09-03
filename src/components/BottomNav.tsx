"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Time Arena", icon: Clock },
  { href: "/dashboard/diary", label: "AI Diary", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Automatically hide bottom nav when typing on mobile so it doesn't float over the keyboard or leave dead space
  useEffect(() => {
    function handleFocusIn(e: FocusEvent) {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        setIsInputFocused(true);
      }
    }

    function handleFocusOut() {
      setIsInputFocused(false);
    }

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 select-none transition-all duration-300 ease-out pointer-events-none",
        isInputFocused ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
      )}
      style={{
        marginBottom: "max(calc(env(safe-area-inset-bottom, 0px) * 0.3), 0px)",
      }}
    >
      <nav
        className={cn(
          "pointer-events-auto flex items-center gap-1 p-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]",
          "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl",
          "border border-zinc-200/80 dark:border-zinc-800/80"
        )}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 active:scale-95",
                isActive
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              )}
            >
              <Icon
                className="h-4 w-4 transition-transform"
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className="tracking-tight">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
