"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/spinner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="app-bg flex h-screen flex-col items-center justify-center gap-4">
        <div className="accent-gradient glow flex h-14 w-14 items-center justify-center rounded-[20px] animate-pulse">
          <Spinner className="h-6 w-6 border-white/30 border-t-white" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">LifeOS</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
