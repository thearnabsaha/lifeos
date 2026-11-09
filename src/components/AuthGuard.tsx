"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { HourRing } from "@/components/HourRing";

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
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
        <HourRing className="size-14 animate-pulse motion-reduce:animate-none" />
        <p className="mono-label">Loading your day…</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
