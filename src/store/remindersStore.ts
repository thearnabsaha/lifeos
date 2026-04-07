import { create } from "zustand";
import { api } from "@/lib/api";

export interface Reminder {
  id: string;
  title: string;
  due_date: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

interface RemindersState {
  reminders: Reminder[];
  isLoading: boolean;
  fetchReminders: () => Promise<void>;
  addReminder: (title: string, dueDate?: string, priority?: Reminder["priority"]) => void;
  toggleComplete: (id: string) => void;
  updateReminder: (id: string, data: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  flushSync: () => Promise<void>;
}

const CACHE_KEY = "reminders:list";
const DIRTY_KEY = "reminders:dirty";

function cached(): Reminder[] {
  try { const r = localStorage.getItem(CACHE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function save(r: Reminder[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(r)); } catch {}
}
function getDirty(): Set<string> {
  try { const r = localStorage.getItem(DIRTY_KEY); return r ? new Set(JSON.parse(r)) : new Set(); } catch { return new Set(); }
}
function setDirty(ids: Set<string>) {
  try { localStorage.setItem(DIRTY_KEY, JSON.stringify([...ids])); } catch {}
}

function genId() {
  return "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export const useRemindersStore = create<RemindersState>((set, get) => ({
  reminders: [],
  isLoading: false,

  fetchReminders: async () => {
    const c = cached();
    if (c.length) set({ reminders: c, isLoading: false });
    else set({ isLoading: true });
    try {
      const data = await api.get<{ reminders: Reminder[] }>("/reminders");
      const dirty = getDirty();
      const local = cached().filter((r) => r.id.startsWith("local-") && dirty.has(r.id));
      const merged = [...data.reminders, ...local];
      save(merged);
      set({ reminders: merged, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addReminder: (title, dueDate, priority) => {
    const reminder: Reminder = {
      id: genId(),
      title,
      due_date: dueDate || null,
      completed: false,
      priority: priority || "medium",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const reminders = [reminder, ...get().reminders];
    save(reminders);
    const dirty = getDirty(); dirty.add(reminder.id); setDirty(dirty);
    set({ reminders });
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => get().flushSync(), 3000);
  },

  toggleComplete: (id) => {
    const r = get().reminders.find((x) => x.id === id);
    if (r) get().updateReminder(id, { completed: !r.completed });
  },

  updateReminder: (id, data) => {
    const reminders = get().reminders.map((r) =>
      r.id === id ? { ...r, ...data, updated_at: new Date().toISOString() } : r
    );
    save(reminders);
    const dirty = getDirty(); dirty.add(id); setDirty(dirty);
    set({ reminders });
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => get().flushSync(), 3000);
  },

  deleteReminder: (id) => {
    const reminders = get().reminders.filter((r) => r.id !== id);
    save(reminders);
    const dirty = getDirty(); dirty.delete(id); setDirty(dirty);
    set({ reminders });
    if (!id.startsWith("local-")) {
      api.delete(`/reminders/${id}`).catch(() => {});
    }
  },

  flushSync: async () => {
    const dirty = getDirty();
    if (dirty.size === 0) return;
    const reminders = get().reminders;
    const synced: string[] = [];

    for (const id of dirty) {
      const r = reminders.find((x) => x.id === id);
      if (!r) { synced.push(id); continue; }
      try {
        if (id.startsWith("local-")) {
          const data = await api.post<{ reminder: Reminder }>("/reminders", {
            title: r.title, due_date: r.due_date, priority: r.priority,
          });
          set((s) => ({
            reminders: s.reminders.map((x) => x.id === id ? data.reminder : x),
          }));
          save(get().reminders);
        } else {
          await api.put(`/reminders/${id}`, {
            title: r.title, due_date: r.due_date, completed: r.completed, priority: r.priority,
          });
        }
        synced.push(id);
      } catch {}
    }

    synced.forEach((id) => dirty.delete(id));
    setDirty(dirty);
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("load", () => setTimeout(() => useRemindersStore.getState().flushSync(), 2500));
}
