"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LogoMark } from "@/components/Logo";

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
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
        <LogoMark className="size-10 animate-pulse" />
        <p className="mono-label">Printing your day…</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
