"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Today", icon: Clock },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));
}

/** Top bar: logo, desktop links, theme toggle. Sits above the scroll container (not fixed). */
export function AppHeader() {
  const isActive = useIsActive();
  return (
    <header
      className="z-40 shrink-0 border-b bg-background/90 backdrop-blur-md select-none"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div className="mx-auto flex h-[58px] max-w-5xl items-center gap-4 px-4">
        <Link href="/dashboard" aria-label="LifeOS home">
          <Logo />
        </Link>
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                isActive(t.href) && "bg-muted text-foreground"
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const isActive = useIsActive();

  return (
    <nav
      id="bottom-nav-bar"
      className="fixed bottom-0 left-0 right-0 z-50 w-full border-t bg-background select-none after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[50vh] after:bg-background after:content-[''] md:hidden"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)",
      }}
    >
      <div className="mx-auto grid h-14 max-w-md grid-cols-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex touch-manipulation flex-col items-center justify-center gap-1 text-muted-foreground transition-colors duration-75 active:bg-muted/60",
                active && "text-foreground"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-8 top-0 h-0.5 rounded-full bg-foreground transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
              <Icon className="size-5" strokeWidth={active ? 2 : 1.5} />
              <span className="font-mono text-[9px] uppercase tracking-widest">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
