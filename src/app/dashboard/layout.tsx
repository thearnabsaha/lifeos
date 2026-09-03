"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prevent iOS Safari from scrolling the root window out of alignment
  useEffect(() => {
    window.scrollTo(0, 0);
    const lockWindowScroll = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("scroll", lockWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", lockWindowScroll);
  }, []);

  return (
    <AuthGuard>
      <div className="fixed inset-0 flex flex-col h-full w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <main
          className="flex-1 w-full overflow-y-auto overscroll-y-contain"
          style={{
            WebkitOverflowScrolling: "touch",
            paddingTop: "max(env(safe-area-inset-top, 0px), 8px)",
            paddingBottom: "16px",
          }}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
