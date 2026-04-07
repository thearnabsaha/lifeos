import { create } from "zustand";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

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
  savingHours: Set<number>;
  setDate: (date: string) => void;
  fetchEntries: (date?: string) => Promise<void>;
  updateEntry: (hour: number, content: string) => Promise<void>;
}

export const useTimeArenaStore = create<TimeArenaState>((set, get) => ({
  selectedDate: formatDate(new Date()),
  entries: [],
  isLoading: false,
  savingHours: new Set(),

  setDate: (date) => {
    set({ selectedDate: date });
    get().fetchEntries(date);
  },

  fetchEntries: async (date) => {
    const targetDate = date || get().selectedDate;
    set({ isLoading: true });
    try {
      const data = await api.get<{ entries: TimeSlot[] }>(
        `/timearena/${targetDate}`
      );
      set({ entries: data.entries, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateEntry: async (hour, content) => {
    const { selectedDate, savingHours } = get();
    const newSaving = new Set(savingHours);
    newSaving.add(hour);
    set({ savingHours: newSaving });

    try {
      const data = await api.post<{ entry: TimeSlot }>("/timearena", {
        date: selectedDate,
        hour,
        content,
      });

      set((state) => {
        const entries = state.entries.map((e) =>
          e.hour === hour
            ? { ...e, id: data.entry.id, content, updatedAt: new Date().toISOString() }
            : e
        );
        const ns = new Set(state.savingHours);
        ns.delete(hour);
        return { entries, savingHours: ns };
      });
    } catch {
      const ns = new Set(get().savingHours);
      ns.delete(hour);
      set({ savingHours: ns });
    }
  },
}));
