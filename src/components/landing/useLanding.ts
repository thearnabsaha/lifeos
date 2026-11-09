"use client";

import { useSyncExternalStore } from "react";

/** True when a LifeOS JWT is stored on this device (the app's auth lives in localStorage). */
function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
export function useHasToken() {
  return useSyncExternalStore(
    subscribeStorage,
    () => {
      try {
        return !!localStorage.getItem("token");
      } catch {
        return false;
      }
    },
    () => false
  );
}

/** Seconds since epoch, ticking once a second on the client; 0 during SSR. */
function subscribeClock(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}
export function useNowSeconds() {
  return useSyncExternalStore(subscribeClock, () => Math.floor(Date.now() / 1000), () => 0);
}
