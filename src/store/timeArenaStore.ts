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

export const useTimeArenaStore = create<TimeArenaState>((set, get) => ({
  selectedDate: formatDate(new Date()),
  entries: [],
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

    // 3) Schedule debounced sync (5s after last edit)
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      get().flushSync();
    }, SYNC_DELAY);
  },

  flushSync: async () => {
    const dirty = getDirtyEntries();
    if (dirty.length === 0) return;

    set({ syncing: true });

    const synced: { date: string; hour: number }[] = [];

    // Send all dirty entries in parallel
    const promises = dirty.map(async (entry) => {
      try {
        const data = await api.post<{ entry: TimeSlot }>("/timearena", {
          date: entry.date,
          hour: entry.hour,
          content: entry.content,
        });

        synced.push({ date: entry.date, hour: entry.hour });

        // Update the cached entry with the server-assigned id
        const { selectedDate } = get();
        if (entry.date === selectedDate) {
          set((state) => ({
            entries: state.entries.map((e) =>
              e.hour === entry.hour && e.date === entry.date
                ? { ...e, id: data.entry.id }
                : e
            ),
          }));
        }
      } catch {
        // Will retry on next sync
      }
    });

    await Promise.all(promises);
    clearDirtyEntries(synced);
    set({ syncing: false });
  },
}));

// Sync any pending dirty entries when the page loads
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    setTimeout(() => {
      useTimeArenaStore.getState().flushSync();
    }, 2000);
  });

  // Sync before the user leaves
  window.addEventListener("beforeunload", () => {
    const dirty = getDirtyEntries();
    if (dirty.length === 0) return;
    // Use sendBeacon for reliable delivery on page close
    const token = localStorage.getItem("token");
    dirty.forEach((entry) => {
      navigator.sendBeacon(
        "/api/timearena",
        new Blob(
          [
            JSON.stringify({
              date: entry.date,
              hour: entry.hour,
              content: entry.content,
            }),
          ],
          { type: "application/json" }
        )
      );
      // sendBeacon doesn't support auth headers, so we also try fetch keepalive
      fetch("/api/timearena", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          date: entry.date,
          hour: entry.hour,
          content: entry.content,
        }),
        keepalive: true,
      }).catch(() => {});
    });
  });
}
