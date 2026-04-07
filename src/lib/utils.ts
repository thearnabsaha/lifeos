import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHour(hour: number): string {
  const start = hour.toString().padStart(2, "0") + ":00";
  const end = ((hour + 1) % 24).toString().padStart(2, "0") + ":00";
  return `${start} – ${end}`;
}

export function getCurrentHour(): number {
  return new Date().getHours();
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
