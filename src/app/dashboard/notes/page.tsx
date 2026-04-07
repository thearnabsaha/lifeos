"use client";

import { useEffect, useState, useRef } from "react";
import { useNotesStore, Note } from "@/store/notesStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, ArrowLeft, Pin, Trash2, Search, StickyNote } from "lucide-react";
import { format } from "date-fns";

function NoteEditor({ note, onBack }: { note: Note; onBack: () => void }) {
  const { updateNote, deleteNote, togglePin } = useNotesStore();
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]);

  useEffect(() => {
    if (!note.title && titleRef.current) titleRef.current.focus();
  }, []);

  function handleTitle(v: string) {
    setTitle(v);
    updateNote(note.id, { title: v });
  }

  function handleContent(v: string) {
    setContent(v);
    updateNote(note.id, { content: v });
  }

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => togglePin(note.id)}
          className={cn("flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
            note.pinned ? "text-amber-500 bg-amber-50 dark:bg-amber-950/30" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <Pin className="h-4 w-4" />
        </button>
        <button
          onClick={() => { deleteNote(note.id); onBack(); }}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 px-4 pb-4">
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => handleTitle(e.target.value)}
          placeholder="Note title"
          className="w-full bg-transparent text-xl font-bold text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600 outline-none mb-3"
        />
        <textarea
          value={content}
          onChange={(e) => handleContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full flex-1 resize-none bg-transparent text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 outline-none"
          style={{ minHeight: "60vh" }}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement;
            t.style.height = "auto";
            t.style.height = Math.max(t.scrollHeight, window.innerHeight * 0.6) + "px";
          }}
        />
      </div>
    </div>
  );
}

export default function NotesPage() {
  const { notes, isLoading, selectedId, setSelected, fetchNotes, createNote } = useNotesStore();
  const [search, setSearch] = useState("");

  useEffect(() => { fetchNotes(); }, []);

  const selected = notes.find((n) => n.id === selectedId);

  if (selected) {
    return <NoteEditor note={selected} onBack={() => setSelected(null)} />;
  }

  const filtered = search
    ? notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    : notes;

  const pinned = filtered.filter((n) => n.pinned);
  const unpinned = filtered.filter((n) => !n.pinned);

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Notes</h1>
        <Button size="sm" onClick={() => createNote()}>
          <Plus className="mr-1 h-4 w-4" /> New
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading && notes.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30">
            <StickyNote className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">No notes yet</h2>
          <p className="mt-1 text-sm text-zinc-500">Tap &quot;New&quot; to create your first note</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pinned.length > 0 && (
            <>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">Pinned</p>
              {pinned.map((n) => <NoteCard key={n.id} note={n} onTap={() => setSelected(n.id)} />)}
            </>
          )}
          {unpinned.length > 0 && pinned.length > 0 && (
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1 pt-2">All Notes</p>
          )}
          {unpinned.map((n) => <NoteCard key={n.id} note={n} onTap={() => setSelected(n.id)} />)}
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onTap }: { note: Note; onTap: () => void }) {
  const preview = note.content.split("\n")[0]?.slice(0, 80) || "No content";
  return (
    <button
      onClick={onTap}
      className="w-full rounded-2xl border border-zinc-100 bg-white p-4 text-left transition-all hover:shadow-sm active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 animate-fade-in"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
            {note.title || "Untitled"}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">{preview}</p>
          <p className="mt-1 text-[10px] text-zinc-400">
            {format(new Date(note.updated_at), "MMM d, h:mm a")}
          </p>
        </div>
        {note.pinned && <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />}
      </div>
    </button>
  );
}
