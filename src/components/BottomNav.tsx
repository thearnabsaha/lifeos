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
      className="flex-shrink-0 w-full border-t border-zinc-200/80 bg-white/95 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/95 z-50 select-none pt-1.5"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
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
                "flex flex-col items-center justify-center gap-0.5 px-4 h-full text-[11px] font-medium transition-colors active:scale-95",
                isActive
                  ? "text-accent font-semibold"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-105"
                )}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className="leading-tight tracking-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
