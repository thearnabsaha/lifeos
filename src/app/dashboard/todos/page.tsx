"use client";

import { useEffect, useState } from "react";
import { useTodosStore, Todo, TodoSchedule } from "@/store/todosStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Plus, Check, Trash2, Sun, Sunrise, Calendar, Inbox, Repeat,
  ChevronRight, ArrowLeft, Clock,
} from "lucide-react";
import { format, isToday, isPast, isTomorrow, isAfter, addDays } from "date-fns";

const SCHEDULES: { value: TodoSchedule; label: string; icon: React.ElementType; color: string; bgColor: string }[] = [
  { value: "today", label: "Today", icon: Sun, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  { value: "tomorrow", label: "Tomorrow", icon: Sunrise, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  { value: "upcoming", label: "Upcoming", icon: Calendar, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" },
  { value: "someday", label: "Someday", icon: Inbox, color: "text-zinc-600 dark:text-zinc-400", bgColor: "bg-zinc-100 dark:bg-zinc-800" },
  { value: "recurring", label: "Recurring", icon: Repeat, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
];

const PRIORITIES: { value: Todo["priority"]; color: string; label: string }[] = [
  { value: "low", color: "bg-green-500", label: "Low" },
  { value: "medium", color: "bg-amber-500", label: "Med" },
  { value: "high", color: "bg-red-500", label: "High" },
];

export default function TodosPage() {
  const { todos, isLoading, fetchTodos } = useTodosStore();
  const [activeSchedule, setActiveSchedule] = useState<TodoSchedule | null>(null);

  useEffect(() => { fetchTodos(); }, []);

  if (activeSchedule) {
    return <TodoList schedule={activeSchedule} onBack={() => setActiveSchedule(null)} />;
  }

  const overdue = todos.filter((t) =>
    !t.completed && t.due_date && isPast(new Date(t.due_date + "T23:59:59")) && !isToday(new Date(t.due_date + "T00:00:00"))
  );

  const counts: Record<TodoSchedule, { total: number; done: number }> = {
    today: { total: 0, done: 0 },
    tomorrow: { total: 0, done: 0 },
    upcoming: { total: 0, done: 0 },
    someday: { total: 0, done: 0 },
    recurring: { total: 0, done: 0 },
  };

  todos.forEach((t) => {
    if (counts[t.schedule]) {
      counts[t.schedule].total++;
      if (t.completed) counts[t.schedule].done++;
    }
  });

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <h1 className="mb-6 text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Todos</h1>

      {isLoading && todos.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-accent" />
        </div>
      ) : (
        <div className="space-y-3">
          {overdue.length > 0 && (
            <Card className="overflow-hidden border-red-200 dark:border-red-900">
              <button
                onClick={() => setActiveSchedule("today")}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                  <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">Overdue</p>
                  <p className="text-xs text-zinc-500">{overdue.length} task{overdue.length !== 1 ? "s" : ""} past due</p>
                </div>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{overdue.length}</span>
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </button>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            {SCHEDULES.map(({ value, label, icon: Icon, color, bgColor }) => {
              const { total, done } = counts[value];
              const pending = total - done;
              return (
                <Card key={value} className="overflow-hidden">
                  <button
                    onClick={() => setActiveSchedule(value)}
                    className="flex w-full flex-col p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bgColor)}>
                        <Icon className={cn("h-4.5 w-4.5", color)} />
                      </div>
                      <span className="text-2xl font-bold text-zinc-900 dark:text-white">{pending}</span>
                    </div>
                    <p className={cn("text-sm font-semibold", color)}>{label}</p>
                    {done > 0 && <p className="text-[10px] text-zinc-400 mt-0.5">{done} completed</p>}
                  </button>
                </Card>
              );
            })}

            <Card className="overflow-hidden">
              <button
                onClick={() => setActiveSchedule("today")}
                className="flex w-full flex-col p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <Check className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {todos.filter((t) => t.completed).length}
                  </span>
                </div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Completed</p>
              </button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function TodoList({ schedule, onBack }: { schedule: TodoSchedule; onBack: () => void }) {
  const { todos, addTodo, toggleComplete, updateTodo, deleteTodo } = useTodosStore();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Todo["priority"]>("medium");

  const sched = SCHEDULES.find((s) => s.value === schedule)!;
  const filtered = todos.filter((t) => t.schedule === schedule);
  const pending = filtered.filter((t) => !t.completed);
  const completed = filtered.filter((t) => t.completed);

  function handleAdd() {
    if (!title.trim()) return;
    addTodo(title.trim(), schedule, dueDate || undefined, priority);
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setShowAdd(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 animate-fade-in">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className={cn("text-xl font-bold tracking-tight", sched.color)}>{sched.label}</h1>
          <p className="text-xs text-zinc-500">{pending.length} pending</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4 mb-4 animate-slide-up">
          <div className="space-y-3">
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-700 dark:text-zinc-300 outline-none"
              />
              <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    title={p.label}
                    className={cn("h-5 w-5 rounded-full transition-all", p.color,
                      priority === p.value ? "ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-900" : "opacity-40"
                    )}
                  />
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={!title.trim()}>Add Todo</Button>
          </div>
        </Card>
      )}

      {pending.length === 0 && completed.length === 0 && (
        <div className="flex flex-col items-center pt-16 animate-fade-in">
          <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl", sched.bgColor)}>
            <sched.icon className={cn("h-8 w-8", sched.color)} />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">No todos here</h2>
          <p className="mt-1 text-sm text-zinc-500">Tap &quot;Add&quot; to create one</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {pending.map((t) => (
            <TodoItem key={t.id} todo={t} onToggle={() => toggleComplete(t.id)} onDelete={() => deleteTodo(t.id)} onUpdate={updateTodo} />
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">Completed ({completed.length})</p>
          <div className="space-y-1.5">
            {completed.map((t) => (
              <TodoItem key={t.id} todo={t} onToggle={() => toggleComplete(t.id)} onDelete={() => deleteTodo(t.id)} onUpdate={updateTodo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete, onUpdate }: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (id: string, data: Partial<Todo>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const priorityColor = PRIORITIES.find((p) => p.value === todo.priority)?.color || "bg-amber-500";

  const isOverdue = todo.due_date && !todo.completed && isPast(new Date(todo.due_date + "T23:59:59")) && !isToday(new Date(todo.due_date + "T00:00:00"));
  const isDueToday = todo.due_date && isToday(new Date(todo.due_date + "T00:00:00"));

  function handleSave() {
    if (title.trim() && title !== todo.title) {
      onUpdate(todo.id, { title: title.trim() });
    }
    setEditing(false);
  }

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-2xl border p-3 transition-all animate-fade-in",
      todo.completed
        ? "border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 opacity-60"
        : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    )}>
      <button
        onClick={onToggle}
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          todo.completed
            ? "border-accent bg-accent text-white"
            : "border-zinc-300 dark:border-zinc-600 hover:border-accent"
        )}
      >
        {todo.completed && <Check className="h-3.5 w-3.5" />}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            className="w-full bg-transparent text-sm font-medium outline-none text-zinc-900 dark:text-white"
          />
        ) : (
          <button onClick={() => !todo.completed && setEditing(true)} className="text-left w-full">
            <p className={cn("text-sm font-medium", todo.completed && "line-through text-zinc-400 dark:text-zinc-500")}>
              {todo.title}
            </p>
          </button>
        )}
        {todo.due_date && (
          <p className={cn("mt-0.5 text-[10px] font-medium",
            isOverdue ? "text-red-500" : isDueToday ? "text-accent" : "text-zinc-400"
          )}>
            {isOverdue ? "Overdue \u2014 " : isDueToday ? "Today \u2014 " : ""}
            {format(new Date(todo.due_date + "T00:00:00"), "MMM d")}
          </p>
        )}
        {todo.recurrence && (
          <p className="mt-0.5 text-[10px] text-purple-500 flex items-center gap-0.5">
            <Repeat className="h-2.5 w-2.5" /> {todo.recurrence}
          </p>
        )}
      </div>

      <div className={cn("h-2 w-2 rounded-full shrink-0", priorityColor)} />

      <button onClick={onDelete} className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
