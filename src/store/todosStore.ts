import { create } from "zustand";
import { api } from "@/lib/api";

export type TodoSchedule = "today" | "tomorrow" | "upcoming" | "someday" | "recurring";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  schedule: TodoSchedule;
  recurrence: string | null;
  priority: "low" | "medium" | "high";
  order: number;
  created_at: string;
  updated_at: string;
}

interface TodosState {
  todos: Todo[];
  isLoading: boolean;
  fetchTodos: () => Promise<void>;
  addTodo: (title: string, schedule?: TodoSchedule, dueDate?: string, priority?: Todo["priority"]) => void;
  toggleComplete: (id: string) => void;
  updateTodo: (id: string, data: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  flushSync: () => Promise<void>;
}

const CACHE_KEY = "todos:list";
const DIRTY_KEY = "todos:dirty";

function cached(): Todo[] {
  try { const r = localStorage.getItem(CACHE_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function save(t: Todo[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(t)); } catch {}
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

export const useTodosStore = create<TodosState>((set, get) => ({
  todos: [],
  isLoading: false,

  fetchTodos: async () => {
    const c = cached();
    if (c.length) set({ todos: c, isLoading: false });
    else set({ isLoading: true });
    try {
      const data = await api.get<{ todos: Todo[] }>("/todos");
      const dirty = getDirty();
      const local = cached().filter((t) => t.id.startsWith("local-") && dirty.has(t.id));
      const merged = [...data.todos, ...local];
      save(merged);
      set({ todos: merged, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addTodo: (title, schedule, dueDate, priority) => {
    const todo: Todo = {
      id: genId(),
      title,
      completed: false,
      due_date: dueDate || null,
      schedule: schedule || "today",
      recurrence: null,
      priority: priority || "medium",
      order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const todos = [todo, ...get().todos];
    save(todos);
    const dirty = getDirty(); dirty.add(todo.id); setDirty(dirty);
    set({ todos });
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => get().flushSync(), 3000);
  },

  toggleComplete: (id) => {
    const t = get().todos.find((x) => x.id === id);
    if (t) get().updateTodo(id, { completed: !t.completed });
  },

  updateTodo: (id, data) => {
    const todos = get().todos.map((t) =>
      t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t
    );
    save(todos);
    const dirty = getDirty(); dirty.add(id); setDirty(dirty);
    set({ todos });
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => get().flushSync(), 3000);
  },

  deleteTodo: (id) => {
    const todos = get().todos.filter((t) => t.id !== id);
    save(todos);
    const dirty = getDirty(); dirty.delete(id); setDirty(dirty);
    set({ todos });
    if (!id.startsWith("local-")) {
      api.delete(`/todos/${id}`).catch(() => {});
    }
  },

  flushSync: async () => {
    const dirty = getDirty();
    if (dirty.size === 0) return;
    const todos = get().todos;
    const synced: string[] = [];

    for (const id of dirty) {
      const t = todos.find((x) => x.id === id);
      if (!t) { synced.push(id); continue; }
      try {
        if (id.startsWith("local-")) {
          const data = await api.post<{ todo: Todo }>("/todos", {
            title: t.title, due_date: t.due_date, schedule: t.schedule,
            recurrence: t.recurrence, priority: t.priority, completed: t.completed,
          });
          set((s) => ({
            todos: s.todos.map((x) => x.id === id ? data.todo : x),
          }));
          save(get().todos);
        } else {
          await api.put(`/todos/${id}`, {
            title: t.title, due_date: t.due_date, schedule: t.schedule,
            recurrence: t.recurrence, priority: t.priority, completed: t.completed,
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
  window.addEventListener("load", () => setTimeout(() => useTodosStore.getState().flushSync(), 2500));
}
