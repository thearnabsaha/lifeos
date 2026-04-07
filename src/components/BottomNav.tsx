"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  StickyNote,
  BookOpen,
  Bell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Clock },
  { href: "/dashboard/notes", label: "Notes", icon: StickyNote },
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90 safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-1">
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
                "flex flex-col items-center gap-0.5 px-2 pb-1 pt-2 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-400 dark:text-zinc-500"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
