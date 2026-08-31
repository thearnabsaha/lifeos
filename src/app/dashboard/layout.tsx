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
      <div className="min-h-[100dvh] flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <main
          className="flex-1 w-full"
          style={{
            paddingTop: "max(env(safe-area-inset-top, 0px), 8px)",
            paddingBottom: "calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 16px)",
          }}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
