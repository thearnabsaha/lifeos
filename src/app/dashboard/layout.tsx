"use client";

import { useEffect, useRef } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // 1. Ensure initial window scroll is 0
    window.scrollTo(0, 0);

    // 2. Viewport Healer for iOS WebKit standalone PWA keyboard shrink bug
    const healViewport = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }

      const container = document.getElementById("app-viewport-container");
      const scroller = mainRef.current;
      const savedScrollTop = scroller ? scroller.scrollTop : 0;

      if (container) {
        // Trigger synchronous WebKit reflow to recalculate device viewport height
        container.style.display = "none";
        void container.offsetHeight; // Forces layout pass
        container.style.display = "";
      }

      if (scroller && savedScrollTop > 0) {
        scroller.scrollTop = savedScrollTop;
      }
    };

    // Staggered trigger on focusout (when iOS keyboard dismisses)
    let timer1: ReturnType<typeof setTimeout> | null = null;
    let timer2: ReturnType<typeof setTimeout> | null = null;

    const handleFocusOut = (e: FocusEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (timer1) clearTimeout(timer1);
        if (timer2) clearTimeout(timer2);

        timer1 = setTimeout(() => {
          const active = document.activeElement;
          const isStillInput =
            active instanceof HTMLInputElement ||
            active instanceof HTMLTextAreaElement;
          if (!isStillInput) {
            healViewport();
          }
        }, 120);

        timer2 = setTimeout(() => {
          const active = document.activeElement;
          const isStillInput =
            active instanceof HTMLInputElement ||
            active instanceof HTMLTextAreaElement;
          if (!isStillInput) {
            healViewport();
          }
        }, 320);
      }
    };

    // Listen to visualViewport expansion (when keyboard closes)
    let lastVHeight = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

    const handleViewportResize = () => {
      if (!window.visualViewport) return;
      const currentHeight = window.visualViewport.height;
      if (currentHeight > lastVHeight + 60) {
        healViewport();
      }
      lastVHeight = currentHeight;
    };

    const handleOrientationChange = () => {
      setTimeout(healViewport, 150);
    };

    document.addEventListener("focusout", handleFocusOut);
    window.addEventListener("orientationchange", handleOrientationChange);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
    }

    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      document.removeEventListener("focusout", handleFocusOut);
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportResize);
      }
    };
  }, []);

  return (
    <AuthGuard>
      <div
        id="app-viewport-container"
        className="relative flex flex-col h-full w-full min-h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950"
        style={{
          height: "100%",
          minHeight: "-webkit-fill-available",
        }}
      >
        <main
          ref={mainRef}
          id="main-scroll-container"
          className="h-full w-full overflow-y-auto overscroll-y-contain"
          style={{
            WebkitOverflowScrolling: "touch",
            paddingTop: "max(env(safe-area-inset-top, 0px), 8px)",
            paddingBottom: "max(calc(env(safe-area-inset-bottom, 0px) + 72px), 84px)",
          }}
        >
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
