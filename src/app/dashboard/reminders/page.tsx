"use client";

import { Bell } from "lucide-react";

export default function RemindersPage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 pt-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-950/30">
        <Bell className="h-8 w-8 text-green-500" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">
        Reminders
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Smart reminders with due dates, recurring tasks, and priority levels.
        Never miss what matters.
      </p>
      <div className="mt-6 rounded-xl bg-green-50 px-4 py-2 text-xs font-medium text-green-600 dark:bg-green-950/30 dark:text-green-400">
        Coming in v2
      </div>
    </div>
  );
}
