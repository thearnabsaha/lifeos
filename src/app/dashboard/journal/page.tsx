"use client";

import { BookOpen } from "lucide-react";

export default function JournalPage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 pt-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/30">
        <BookOpen className="h-8 w-8 text-purple-500" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">
        Journal
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Your daily journal with prompts, reflections, and mood tracking. A
        private space for your thoughts.
      </p>
      <div className="mt-6 rounded-xl bg-purple-50 px-4 py-2 text-xs font-medium text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
        Coming in v2
      </div>
    </div>
  );
}
