import { create } from "zustand";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export interface DiaryEntry {
  id?: string;
  date: string;
  title: string;
  mood: string;
  summary: string;
  highlights?: string[];
  stats?: {
    loggedHours: number;
    activeSpan: string;
    focusScore: number;
  };
  created_at?: string;
  updated_at?: string;
}

interface DiaryState {
  selectedDate: string;
  currentDiary: DiaryEntry | null;
  recentDiaries: DiaryEntry[];
  isLoading: boolean;
  isGenerating: boolean;
  setDate: (date: string) => void;
  fetchDiary: (date?: string) => Promise<void>;
  generateDiary: (date?: string, regenerate?: boolean) => Promise<DiaryEntry | null>;
  saveDiaryText: (date: string, summary: string) => Promise<void>;
  fetchRecentDiaries: () => Promise<void>;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  selectedDate: formatDate(new Date()),
  currentDiary: null,
  recentDiaries: [],
  isLoading: false,
  isGenerating: false,

  setDate: (date) => {
    set({ selectedDate: date });
    get().fetchDiary(date);
  },

  fetchDiary: async (date) => {
    const targetDate = date || get().selectedDate;
    set({ isLoading: true });

    try {
      const res = await api.get<{ diary: DiaryEntry | null }>(`/diary?date=${targetDate}`);
      set({ currentDiary: res.diary, isLoading: false });
    } catch {
      set({ currentDiary: null, isLoading: false });
    }
  },

  generateDiary: async (date, regenerate = true) => {
    const targetDate = date || get().selectedDate;
    set({ isGenerating: true });

    try {
      const res = await api.post<{ diary: DiaryEntry }>("/diary", {
        date: targetDate,
        regenerate,
      });

      set({ currentDiary: res.diary, isGenerating: false });
      get().fetchRecentDiaries();
      return res.diary;
    } catch (err) {
      console.error("Failed to generate diary:", err);
      set({ isGenerating: false });
      return null;
    }
  },

  saveDiaryText: async (date, summary) => {
    try {
      const res = await api.put<{ diary: DiaryEntry }>("/diary", { date, summary });
      if (res.diary) {
        set({ currentDiary: res.diary });
      }
    } catch (err) {
      console.error("Failed to save diary text:", err);
    }
  },

  fetchRecentDiaries: async () => {
    try {
      const res = await api.get<{ diaries: DiaryEntry[] }>("/diary");
      if (res.diaries) {
        set({ recentDiaries: res.diaries });
      }
    } catch (err) {
      console.error("Failed to fetch recent diaries:", err);
    }
  },
}));
