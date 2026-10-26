"use client";

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

  return (
    <nav
      id="bottom-nav-bar"
      className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-zinc-900/5 bg-white/80 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/5 dark:bg-zinc-950/80 select-none pt-1.5"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)",
      }}
    >
      <div className="mx-auto flex h-12 max-w-md items-center justify-around px-4">
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
                "relative flex flex-col items-center justify-center gap-0.5 px-4 h-full text-[11px] font-medium transition-all duration-300 active:scale-90",
                isActive
                  ? "text-accent font-semibold"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <span
                className={cn(
                  "absolute -top-1.5 h-[3px] rounded-full bg-accent transition-all duration-300",
                  isActive ? "w-6 opacity-100 glow" : "w-0 opacity-0"
                )}
              />
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-all duration-300",
                  isActive && "bg-accent/12"
                )}
              >
                <Icon
                  className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-105")}
                  strokeWidth={isActive ? 2.4 : 1.75}
                />
              </span>
              <span className="leading-tight tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
