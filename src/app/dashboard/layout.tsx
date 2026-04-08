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
      <div className="fixed inset-0 flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <main
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ paddingBottom: "calc(var(--nav-height) + var(--safe-bottom) + 8px)" }}
        >
          <div className="pt-2" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 8px)" }}>
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
