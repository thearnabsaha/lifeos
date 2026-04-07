"use client";

import { StickyNote } from "lucide-react";

export default function NotesPage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 pt-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30">
        <StickyNote className="h-8 w-8 text-amber-500" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">
        Notes
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Your Apple Notes-style editor is coming soon. Capture thoughts, create
        lists, and organize everything in one place.
      </p>
      <div className="mt-6 rounded-xl bg-amber-50 px-4 py-2 text-xs font-medium text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
        Coming in v2
      </div>
    </div>
  );
}
