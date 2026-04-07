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
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
        <main className="flex-1 pb-20">{children}</main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
