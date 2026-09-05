"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") {
        // In local development, unregister any lingering service workers to avoid stale chunk errors
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            reg.unregister();
          }
        });
      } else {
        // In production, register and check for updates
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            reg.update();
            setInterval(() => reg.update(), 60000);
          })
          .catch((err) => {
            console.warn("SW registration failed:", err);
          });
      }
    }
  }, []);

  return null;
}
