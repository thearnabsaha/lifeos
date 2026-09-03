"use client";

import { useEffect, useState } from "react";
import { useDiaryStore } from "@/store/diaryStore";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Sparkles,
  BookOpen,
  Calendar,
  Check,
  Copy,
  Edit3,
  Clock,
  ChevronRight,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DiaryPage() {
  const {
    selectedDate,
    currentDiary,
    recentDiaries,
    isLoading,
    isGenerating,
    setDate,
    fetchDiary,
    generateDiary,
    saveDiaryText,
    fetchRecentDiaries,
  } = useDiaryStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDiary(selectedDate);
    fetchRecentDiaries();
  }, [selectedDate, fetchDiary, fetchRecentDiaries]);

  useEffect(() => {
    if (currentDiary) {
      setEditedText(currentDiary.summary);
      setIsEditing(false);
    }
  }, [currentDiary]);

  async function handleGenerate(regenerate = true) {
    await generateDiary(selectedDate, regenerate);
  }

  async function handleSaveEdit() {
    await saveDiaryText(selectedDate, editedText);
    setIsEditing(false);
  }

  function handleCopy() {
    if (!currentDiary?.summary) return;
    navigator.clipboard.writeText(
      `${currentDiary.title}\nMood: ${currentDiary.mood}\n\n${currentDiary.summary}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasDiary = !!currentDiary && !!currentDiary.summary;

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-28">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Life Diary</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Daily Journal
          </h1>
        </div>

        <Button
          size="sm"
          onClick={() => handleGenerate(true)}
          disabled={isGenerating}
          className="rounded-full gap-1.5 text-xs font-medium shadow-sm active:scale-95 transition-all"
        >
          {isGenerating ? (
            <>
              <Spinner className="h-3.5 w-3.5" />
              <span>Writing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>{hasDiary ? "Regenerate" : "Generate Diary"}</span>
            </>
          )}
        </Button>
      </div>

      {/* Date Switcher */}
      <div className="mb-4 rounded-2xl border border-zinc-200/70 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs">
        <DatePicker selectedDate={selectedDate} onDateChange={setDate} />
      </div>

      {/* Main Diary Entry View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
          <Spinner className="h-6 w-6 mb-2 text-accent" />
          <p className="text-xs">Opening diary page...</p>
        </div>
      ) : hasDiary ? (
        <div className="space-y-4">
          {/* Aesthetic Diary Paper Card */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50/50 p-5 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950/80">
            {/* Soft decorative top line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/40 via-accent to-accent/20" />

            {/* Title and Mood Tag */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                  {currentDiary.title}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {currentDiary.mood}
                  </span>
                  {currentDiary.stats?.loggedHours !== undefined && (
                    <span className="text-[11px] text-zinc-400">
                      • {currentDiary.stats.loggedHours} hours captured
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  title="Copy entry"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  title="Edit entry"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    isEditing
                      ? "bg-accent text-white"
                      : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  )}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Diary Content / Editor */}
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  rows={8}
                  className="w-full resize-none rounded-xl border border-zinc-300 bg-white p-3 text-sm leading-relaxed outline-none focus:border-accent dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-normal">
                {currentDiary.summary.split("\n\n").map((para, i) => (
                  <p key={i} className="first-letter:text-lg first-letter:font-semibold first-letter:text-accent">
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Key Timeline Highlights */}
            {currentDiary.highlights && currentDiary.highlights.length > 0 && (
              <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Key Timeline Blocks
                </h3>
                <div className="space-y-1.5">
                  {currentDiary.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl bg-zinc-100/70 px-3 py-1.5 text-xs text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400"
                    >
                      <Clock className="h-3 w-3 shrink-0 text-accent" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State: Prompt to generate */
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="mb-1 text-base font-semibold text-zinc-900 dark:text-white">
            No Diary Entry for this Date
          </h2>
          <p className="mb-5 max-w-xs text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Click the button below to turn your Time Arena hours into a beautiful personal diary reflection.
          </p>
          <Button
            onClick={() => handleGenerate(true)}
            disabled={isGenerating}
            className="rounded-full gap-2 px-5 active:scale-95"
          >
            {isGenerating ? (
              <>
                <Spinner className="h-4 w-4" />
                <span>Writing Diary...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Diary from Time Arena</span>
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Past Diary History */}
      {recentDiaries.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-accent" />
              <span>Past Journal Entries</span>
            </h3>
            <span className="text-xs text-zinc-400">{recentDiaries.length} entries</span>
          </div>

          <div className="space-y-2">
            {recentDiaries.map((entry) => {
              const isCurrent = entry.date === selectedDate;
              return (
                <button
                  key={entry.date}
                  onClick={() => setDate(entry.date)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-2xl border p-3 text-left transition-all active:scale-[0.99]",
                    isCurrent
                      ? "border-accent bg-accent/5 dark:bg-accent/10 shadow-xs"
                      : "border-zinc-200/70 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                  )}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                        {entry.date}
                      </span>
                      <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {entry.mood?.split(" ")[0]}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {entry.summary}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
