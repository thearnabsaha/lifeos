import { create } from "zustand";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  getCachedEntries,
  setCachedEntries,
  updateCachedEntry,
  getDirtyEntries,
  markDirty,
  clearDirtyEntries,
} from "@/lib/localStore";

export interface TimeSlot {
  id: string | null;
  hour: number;
  content: string;
  date: string;
  updatedAt: string | null;
}

interface TimeArenaState {
  selectedDate: string;
  entries: TimeSlot[];
  isLoading: boolean;
  syncing: boolean;
  setDate: (date: string) => void;
  fetchEntries: (date?: string) => Promise<void>;
  updateEntry: (hour: number, content: string) => void;
  flushSync: () => Promise<void>;
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;
const SYNC_DELAY = 5000;

function emptySlots(date: string): TimeSlot[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    id: null,
    hour,
    content: "",
    date,
    updatedAt: null,
  }));
}

const initialDate = formatDate(new Date());

export const useTimeArenaStore = create<TimeArenaState>((set, get) => ({
  selectedDate: initialDate,
  entries: emptySlots(initialDate),
  isLoading: false,
  syncing: false,

  setDate: (date) => {
    set({ selectedDate: date });
    get().fetchEntries(date);
  },

  fetchEntries: async (date) => {
    const targetDate = date || get().selectedDate;

    // 1) Show cached data instantly
    const cached = getCachedEntries(targetDate);
    if (cached) {
      set({ entries: cached, isLoading: false });
    } else {
      set({ entries: emptySlots(targetDate), isLoading: true });
    }

    // 2) Fetch from server in background
    try {
      const data = await api.get<{ entries: TimeSlot[] }>(
        `/timearena/${targetDate}`
      );

      // Merge: keep local edits that haven't synced yet
      const dirty = getDirtyEntries().filter((d) => d.date === targetDate);
      const merged = data.entries.map((serverSlot) => {
        const localEdit = dirty.find((d) => d.hour === serverSlot.hour);
        if (localEdit) return { ...serverSlot, content: localEdit.content };
        return serverSlot;
      });

      setCachedEntries(targetDate, merged);
      if (get().selectedDate === targetDate) {
        set({ entries: merged, isLoading: false });
      }
    } catch {
      // Offline or error — cached data is already shown
      set({ isLoading: false });
    }
  },

  updateEntry: (hour, content) => {
    const { selectedDate } = get();

    // 1) Update localStorage + UI instantly
    const updated = updateCachedEntry(selectedDate, hour, content);
    set({ entries: updated });

    // 2) Mark as dirty for sync
    markDirty(selectedDate, hour, content);

    // 3) Debounce server sync
    if (syncTimer) clearTimeout(syncTimer);
    set({ syncing: true });

    syncTimer = setTimeout(async () => {
      await get().flushSync();
    }, SYNC_DELAY);
  },

  flushSync: async () => {
    const dirty = getDirtyEntries();
    if (dirty.length === 0) {
      set({ syncing: false });
      return;
    }

    try {
      const synced: { date: string; hour: number }[] = [];
      for (const item of dirty) {
        await api.post("/timearena", {
          date: item.date,
          hour: item.hour,
          content: item.content,
        });
        synced.push({ date: item.date, hour: item.hour });
      }
      clearDirtyEntries(synced);
    } catch (err) {
      console.warn("Sync failed, will retry:", err);
    } finally {
      set({ syncing: false });
    }
  },
}));
