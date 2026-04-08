import { create } from "zustand";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  content: string;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

interface JournalState {
  entries: JournalEntry[];
  selectedDate: string;
  currentEntry: JournalEntry | null;
  isLoading: boolean;
  isGenerating: boolean;
  setDate: (date: string) => void;
  fetchEntries: () => Promise<void>;
  fetchEntry: (date: string) => Promise<void>;
  saveEntry: (date: string, content: string, mood: string) => void;
  clearEntry: (date: string) => Promise<void>;
  generateFromTimeArena: (date: string) => Promise<string | null>;
  flushSync: () => Promise<void>;
}

const LIST_KEY = "journal:entries";
const ENTRY_PREFIX = "journal:entry:";
const DIRTY_KEY = "journal:dirty";

function cachedList(): JournalEntry[] {
  try { const r = localStorage.getItem(LIST_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function cachedEntry(date: string): JournalEntry | null {
  try { const r = localStorage.getItem(ENTRY_PREFIX + date); return r ? JSON.parse(r) : null; } catch { return null; }
}
function getDirty(): Set<string> {
  try { const r = localStorage.getItem(DIRTY_KEY); return r ? new Set(JSON.parse(r)) : new Set(); } catch { return new Set(); }
}
function setDirtyDates(dates: Set<string>) {
  try { localStorage.setItem(DIRTY_KEY, JSON.stringify([...dates])); } catch {}
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  selectedDate: formatDate(new Date()),
  currentEntry: null,
  isLoading: false,
  isGenerating: false,

  setDate: (date) => {
    set({ selectedDate: date });
    get().fetchEntry(date);
  },

  fetchEntries: async () => {
    const c = cachedList();
    if (c.length) set({ entries: c });
    try {
      const data = await api.get<{ entries: JournalEntry[] }>("/journal");
      try { localStorage.setItem(LIST_KEY, JSON.stringify(data.entries)); } catch {}
      set({ entries: data.entries });
    } catch {}
  },

  fetchEntry: async (date) => {
    const c = cachedEntry(date);
    if (c) set({ currentEntry: c, isLoading: false });
    else set({ currentEntry: null, isLoading: true });

    try {
      const data = await api.get<{ entry: JournalEntry | null }>(`/journal/${date}`);
      if (data.entry) {
        try { localStorage.setItem(ENTRY_PREFIX + date, JSON.stringify(data.entry)); } catch {}
      }
      if (get().selectedDate === date) {
        const dirty = getDirty();
        if (dirty.has(date) && c) {
          set({ isLoading: false });
        } else {
          set({ currentEntry: data.entry, isLoading: false });
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },

  saveEntry: (date, content, mood) => {
    const existing = get().currentEntry;
    const entry: JournalEntry = {
      id: existing?.id || "local-" + date,
      date,
      mood,
      content,
      ai_generated: existing?.ai_generated || false,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    try { localStorage.setItem(ENTRY_PREFIX + date, JSON.stringify(entry)); } catch {}
    set({ currentEntry: entry });

    const dirty = getDirty(); dirty.add(date); setDirtyDates(dirty);
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => get().flushSync(), 3000);
  },

  clearEntry: async (date) => {
    try { localStorage.removeItem(ENTRY_PREFIX + date); } catch {}
    const dirty = getDirty(); dirty.delete(date); setDirtyDates(dirty);
    set({ currentEntry: null });

    try {
      await api.delete(`/journal/${date}`);
    } catch {}

    const entries = get().entries.filter((e) => e.date !== date);
    try { localStorage.setItem(LIST_KEY, JSON.stringify(entries)); } catch {}
    set({ entries });
  },

  generateFromTimeArena: async (date) => {
    set({ isGenerating: true });
    try {
      const data = await api.post<{ content: string }>("/journal/generate", { date });
      set({ isGenerating: false });
      return data.content;
    } catch (err) {
      set({ isGenerating: false });
      throw err;
    }
  },

  flushSync: async () => {
    const dirty = getDirty();
    if (dirty.size === 0) return;
    const synced: string[] = [];

    for (const date of dirty) {
      const entry = cachedEntry(date);
      if (!entry) { synced.push(date); continue; }
      try {
        await api.post("/journal", {
          date: entry.date,
          mood: entry.mood,
          content: entry.content,
          ai_generated: entry.ai_generated,
        });
        synced.push(date);
      } catch {}
    }

    synced.forEach((d) => dirty.delete(d));
    setDirtyDates(dirty);
    get().fetchEntries();
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("load", () => setTimeout(() => useJournalStore.getState().flushSync(), 3000));
}
