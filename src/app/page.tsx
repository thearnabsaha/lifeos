"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HourRing } from "@/components/HourRing";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <HourRing className="size-14 text-foreground" />
    </div>
  );
}
