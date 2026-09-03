"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="fixed inset-0 flex flex-col h-full w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <main
          className="flex-1 w-full overflow-y-auto overscroll-y-contain"
          style={{
            WebkitOverflowScrolling: "touch",
            paddingTop: "max(env(safe-area-inset-top, 0px), 8px)",
            paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 72px), 80px)",
          }}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
