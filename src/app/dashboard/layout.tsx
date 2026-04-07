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
      <div className="flex min-h-[100dvh] flex-col bg-zinc-50 dark:bg-zinc-950">
        <main className="flex-1 pt-2 pb-24 safe-area-top">{children}</main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
