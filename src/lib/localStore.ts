import { TimeSlot } from "@/store/timeArenaStore";

const ENTRIES_PREFIX = "ta:entries:";
const DIRTY_KEY = "ta:dirty";
const USER_KEY = "auth:user";

function emptySlots(date: string): TimeSlot[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    id: null,
    hour,
    content: "",
    date,
    updatedAt: null,
  }));
}

export function getCachedEntries(date: string): TimeSlot[] | null {
  try {
    const raw = localStorage.getItem(ENTRIES_PREFIX + date);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedEntries(date: string, entries: TimeSlot[]) {
  try {
    localStorage.setItem(ENTRIES_PREFIX + date, JSON.stringify(entries));
  } catch {
    // storage full — clear old dates
    pruneOldEntries(date);
  }
}

export function updateCachedEntry(
  date: string,
  hour: number,
  content: string
): TimeSlot[] {
  const entries = getCachedEntries(date) || emptySlots(date);
  const updated = entries.map((e) =>
    e.hour === hour ? { ...e, content, updatedAt: new Date().toISOString() } : e
  );
  setCachedEntries(date, updated);
  return updated;
}

// --- Dirty tracking for background sync ---

interface DirtyEntry {
  date: string;
  hour: number;
  content: string;
  ts: number;
}

export function getDirtyEntries(): DirtyEntry[] {
  try {
    const raw = localStorage.getItem(DIRTY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markDirty(date: string, hour: number, content: string) {
  const dirty = getDirtyEntries();
  const existing = dirty.findIndex(
    (d) => d.date === date && d.hour === hour
  );
  const entry: DirtyEntry = { date, hour, content, ts: Date.now() };

  if (existing >= 0) {
    dirty[existing] = entry;
  } else {
    dirty.push(entry);
  }

  localStorage.setItem(DIRTY_KEY, JSON.stringify(dirty));
}

export function clearDirtyEntries(synced: { date: string; hour: number }[]) {
  const dirty = getDirtyEntries();
  const remaining = dirty.filter(
    (d) => !synced.some((s) => s.date === d.date && s.hour === d.hour)
  );
  localStorage.setItem(DIRTY_KEY, JSON.stringify(remaining));
}

export function clearAllDirty() {
  localStorage.removeItem(DIRTY_KEY);
}

// --- User cache ---

export function getCachedUser(): { id: string; email: string; name: string | null } | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedUser(user: { id: string; email: string; name: string | null }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCachedUser() {
  localStorage.removeItem(USER_KEY);
}

// --- Pruning ---

function pruneOldEntries(keepDate: string) {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(ENTRIES_PREFIX) && key !== ENTRIES_PREFIX + keepDate) {
      keys.push(key);
    }
  }
  keys.sort();
  const removeCount = Math.max(1, Math.floor(keys.length / 2));
  keys.slice(0, removeCount).forEach((k) => localStorage.removeItem(k));
}
