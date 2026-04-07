import { create } from "zustand";
import { api } from "@/lib/api";

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  selectedId: string | null;
  setSelected: (id: string | null) => void;
  fetchNotes: () => Promise<void>;
  createNote: () => Note;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  flushSync: () => Promise<void>;
}

const CACHE_KEY = "notes:list";
const DIRTY_KEY = "notes:dirty";

function cached(): Note[] {
  try { const r = localStorage.getItem(CACHE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function save(notes: Note[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(notes)); } catch {}
}
function getDirty(): Set<string> {
  try { const r = localStorage.getItem(DIRTY_KEY); return r ? new Set(JSON.parse(r)) : new Set(); } catch { return new Set(); }
}
function setDirty(ids: Set<string>) {
  try { localStorage.setItem(DIRTY_KEY, JSON.stringify([...ids])); } catch {}
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

function genId() {
  return "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  selectedId: null,

  setSelected: (id) => set({ selectedId: id }),

  fetchNotes: async () => {
    const c = cached();
    if (c.length) set({ notes: c, isLoading: false });
    else set({ isLoading: true });

    try {
      const data = await api.get<{ notes: Note[] }>("/notes");
      const dirty = getDirty();
      const local = cached();
      const serverMap = new Map(data.notes.map((n) => [n.id, n]));

      const merged = [...data.notes];
      local.forEach((ln) => {
        if (ln.id.startsWith("local-") && dirty.has(ln.id)) {
          merged.push(ln);
        }
      });
      merged.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated_at.localeCompare(a.updated_at));

      save(merged);
      set({ notes: merged, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createNote: () => {
    const note: Note = {
      id: genId(),
      title: "",
      content: "",
      pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const notes = [note, ...get().notes];
    save(notes);
    const dirty = getDirty(); dirty.add(note.id); setDirty(dirty);
    set({ notes, selectedId: note.id });
    return note;
  },

  updateNote: (id, data) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, ...data, updated_at: new Date().toISOString() } : n
    );
    save(notes);
    const dirty = getDirty(); dirty.add(id); setDirty(dirty);
    set({ notes });
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => get().flushSync(), 3000);
  },

  deleteNote: (id) => {
    const notes = get().notes.filter((n) => n.id !== id);
    save(notes);
    const dirty = getDirty(); dirty.delete(id); setDirty(dirty);
    set({ notes, selectedId: get().selectedId === id ? null : get().selectedId });
    if (!id.startsWith("local-")) {
      api.delete(`/notes/${id}`).catch(() => {});
    }
  },

  togglePin: (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (note) get().updateNote(id, { pinned: !note.pinned });
  },

  flushSync: async () => {
    const dirty = getDirty();
    if (dirty.size === 0) return;
    const notes = get().notes;
    const synced: string[] = [];

    for (const id of dirty) {
      const note = notes.find((n) => n.id === id);
      if (!note) { synced.push(id); continue; }
      try {
        if (id.startsWith("local-")) {
          const data = await api.post<{ note: Note }>("/notes", {
            title: note.title, content: note.content, pinned: note.pinned,
          });
          set((s) => ({
            notes: s.notes.map((n) => n.id === id ? { ...data.note } : n),
            selectedId: s.selectedId === id ? data.note.id : s.selectedId,
          }));
          save(get().notes);
        } else {
          await api.put(`/notes/${id}`, { title: note.title, content: note.content, pinned: note.pinned });
        }
        synced.push(id);
      } catch {}
    }

    synced.forEach((id) => dirty.delete(id));
    setDirty(dirty);
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("load", () => setTimeout(() => useNotesStore.getState().flushSync(), 2000));
}
