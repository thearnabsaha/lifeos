"use client";

import { useEffect, useState, useCallback } from "react";
import { useJournalStore, JournalEntry } from "@/store/journalStore";
import { Attachments } from "@/components/Attachments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sparkles, Bot, BookOpen, Paperclip, Trash2 } from "lucide-react";
import { format, addDays, subDays, isToday } from "date-fns";

const MOODS = [
  { value: "great", emoji: "\u{1F604}", label: "Great" },
  { value: "good", emoji: "\u{1F642}", label: "Good" },
  { value: "okay", emoji: "\u{1F610}", label: "Okay" },
  { value: "bad", emoji: "\u{1F614}", label: "Bad" },
  { value: "terrible", emoji: "\u{1F622}", label: "Terrible" },
];

export default function JournalPage() {
  const {
    entries, selectedDate, currentEntry, isLoading, isGenerating,
    setDate, fetchEntries, fetchEntry, saveEntry, clearEntry, generateFromTimeArena,
  } = useJournalStore();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [error, setError] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [confirmClear, setConfirmClear] = useState(0);

  useEffect(() => { fetchEntries(); fetchEntry(selectedDate); }, []);

  useEffect(() => {
    if (currentEntry) {
      setContent(currentEntry.content);
      setMood(currentEntry.mood);
    } else {
      setContent("");
      setMood("");
    }
    setShowAttachments(false);
    setConfirmClear(0);
  }, [currentEntry?.id, currentEntry?.date, selectedDate]);

  const date = new Date(selectedDate + "T00:00:00");
  const todayCheck = isToday(date);

  function goBack() { setDate(format(subDays(date, 1), "yyyy-MM-dd")); }
  function goForward() { setDate(format(addDays(date, 1), "yyyy-MM-dd")); }
  function goToday() { setDate(format(new Date(), "yyyy-MM-dd")); }

  const handleContentChange = useCallback((text: string) => {
    setContent(text);
    saveEntry(selectedDate, text, mood);
  }, [selectedDate, mood, saveEntry]);

  const handleMoodChange = useCallback((m: string) => {
    setMood(m);
    saveEntry(selectedDate, content, m);
  }, [selectedDate, content, saveEntry]);

  async function handleGenerate() {
    setError("");
    try {
      const text = await generateFromTimeArena(selectedDate);
      if (text) {
        setContent(text);
        saveEntry(selectedDate, text, mood);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    }
  }

  function handleClear() {
    if (confirmClear === 0) {
      setConfirmClear(1);
      setTimeout(() => setConfirmClear((c) => c === 1 ? 0 : c), 4000);
      return;
    }
    if (confirmClear === 1) {
      setConfirmClear(2);
      setTimeout(() => setConfirmClear((c) => c === 2 ? 0 : c), 4000);
      return;
    }
    clearEntry(selectedDate);
    setContent("");
    setMood("");
    setConfirmClear(0);
  }

  const entryId = currentEntry?.id || null;

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <h1 className="mb-4 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Journal</h1>

      <Card className="p-3 mb-4">
        <div className="flex items-center justify-between">
          <button onClick={goBack} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={goToday} className="flex flex-col items-center">
            <span className={cn("text-lg font-bold", todayCheck ? "text-accent" : "text-zinc-900 dark:text-white")}>
              {todayCheck ? "Today" : format(date, "EEE, MMM d")}
            </span>
            {!todayCheck && <span className="text-[10px] text-accent">Tap for today</span>}
          </button>
          <button onClick={goForward} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">How are you feeling?</p>
        <div className="flex justify-between gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => handleMoodChange(m.value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl border p-2 transition-all text-xs",
                mood === m.value
                  ? "border-accent bg-accent-light"
                  : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200"
              )}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-zinc-500 dark:text-zinc-400">{m.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Journal Entry</p>
          <div className="flex items-center gap-1.5">
            {(content || mood) && (
              <button
                onClick={handleClear}
                className={cn("flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-all",
                  confirmClear === 0
                    ? "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    : confirmClear === 1
                    ? "text-amber-600 bg-amber-50 dark:bg-amber-950/30"
                    : "text-red-600 bg-red-50 dark:bg-red-950/30"
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {confirmClear === 0 ? "Clear" : confirmClear === 1 ? "Sure?" : "Delete!"}
              </button>
            )}
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                showAttachments ? "text-accent bg-accent-light" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <Button size="sm" variant="secondary" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <><div className="mr-1.5 h-3 w-3 animate-spin rounded-full border-2 border-zinc-300 border-t-accent" /> Generating...</>
              ) : (
                <><Sparkles className="mr-1 h-3.5 w-3.5" /> AI Generate</>
              )}
            </Button>
          </div>
        </div>

        {error && <p className="mb-2 text-xs text-red-500 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2">{error}</p>}

        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write about your day..."
          className="w-full resize-none overflow-hidden bg-transparent text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 outline-none"
          style={{ minHeight: "50vh" }}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement;
            t.style.height = "auto";
            t.style.height = Math.max(t.scrollHeight, window.innerHeight * 0.5) + "px";
          }}
        />

        {showAttachments && (
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <p className="mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Attachments</p>
            <Attachments parentType="journal" parentId={entryId} />
          </div>
        )}
      </Card>

      {entries.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">Past Entries</p>
          <div className="space-y-2">
            {entries.filter((e) => e.date !== selectedDate).slice(0, 10).map((entry) => (
              <PastEntryCard key={entry.id} entry={entry} onTap={() => setDate(entry.date)} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && entries.length === 0 && !currentEntry && (
        <div className="flex flex-col items-center pt-8 animate-fade-in">
          <BookOpen className="h-10 w-10 text-purple-400 mb-3" />
          <p className="text-sm text-zinc-500">Start writing or let AI generate from your Time Arena</p>
        </div>
      )}
    </div>
  );
}

function PastEntryCard({ entry, onTap }: { entry: JournalEntry; onTap: () => void }) {
  const moodEmoji = MOODS.find((m) => m.value === entry.mood)?.emoji;
  const preview = entry.content.split("\n")[0]?.slice(0, 100) || "No content";
  return (
    <button
      onClick={onTap}
      className="w-full rounded-2xl border border-zinc-100 bg-white p-3 text-left transition-all hover:shadow-sm active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 animate-fade-in"
    >
      <div className="flex items-start gap-2">
        {moodEmoji && <span className="text-lg">{moodEmoji}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              {format(new Date(entry.date + "T00:00:00"), "EEE, MMM d")}
            </p>
            {entry.ai_generated && (
              <span className="flex items-center gap-0.5 rounded-full bg-purple-50 px-1.5 py-0.5 text-[9px] font-medium text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
                <Bot className="h-2.5 w-2.5" /> AI
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">{preview}</p>
        </div>
      </div>
    </button>
  );
}
