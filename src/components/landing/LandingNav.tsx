"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useHasToken } from "./useLanding";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#mcp", label: "AI / MCP" },
  { href: "#install", label: "Install" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const authed = useHasToken();
  return (
    <header
      className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-[58px] max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link href="/" aria-label="LifeOS home" className="mr-2">
          <Logo />
        </Link>
        <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Sections">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          {!authed && (
            <Link
              href="/login"
              className="hidden h-9 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Log in
            </Link>
          )}
          <ThemeToggle className="size-9" />
          <Link
            href={authed ? "/dashboard" : "/login"}
            className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-primary pl-4 pr-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 active:translate-y-px"
          >
            Open app
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
