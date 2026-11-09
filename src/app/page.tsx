"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  );
}
