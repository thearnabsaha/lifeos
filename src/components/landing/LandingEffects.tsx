"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * - Installed PWA opened at "/" (e.g. an old home-screen icon): go straight into the app.
 * - Scroll reveals: below-the-fold `.reveal` blocks fade up once as they enter view.
 */
export function LandingEffects() {
  const router = useRouter();

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) {
      router.replace(localStorage.getItem("token") ? "/dashboard" : "/login");
    }
  }, [router]);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-shown", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      document.documentElement.classList.remove("js-reveal");
    };
  }, []);

  return null;
}
