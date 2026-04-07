"use client";

import { useEffect, useState } from "react";
import { useRemindersStore, Reminder } from "@/store/remindersStore";
import { Attachments } from "@/components/Attachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Check, Bell, ChevronDown, ChevronUp, Paperclip } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

const PRIORITIES: { value: Reminder["priority"]; color: string; label: string }[] = [
  { value: "low", color: "bg-green-500", label: "Low" },
  { value: "medium", color: "bg-amber-500", label: "Med" },
  { value: "high", color: "bg-red-500", label: "High" },
];

export default function RemindersPage() {
  const { reminders, isLoading, fetchReminders, addReminder, toggleComplete, deleteReminder } = useRemindersStore();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Reminder["priority"]>("medium");

  useEffect(() => { fetchReminders(); }, []);

  function handleAdd() {
    if (!title.trim()) return;
    addReminder(title.trim(), dueDate || undefined, priority);
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setShowAdd(false);
  }

  const upcoming = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed);

  return (
    <div className="mx-auto max-w-lg px-4 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Reminders</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <ChevronUp className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
          {showAdd ? "Close" : "Add"}
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4 mb-4 animate-slide-up">
          <div className="space-y-3">
            <Input placeholder="What do you need to remember?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
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
                    className={cn("h-5 w-5 rounded-full transition-all", p.color, priority === p.value ? "ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-900" : "opacity-40")}
                  />
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={!title.trim()}>Add Reminder</Button>
          </div>
        </Card>
      )}

      {isLoading && reminders.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center pt-20 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-950/30">
            <Bell className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">All clear!</h2>
          <p className="mt-1 text-sm text-zinc-500">Tap &quot;Add&quot; to create a reminder</p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">Upcoming ({upcoming.length})</p>
              <div className="space-y-2">
                {upcoming.map((r) => (
                  <ReminderCard key={r.id} reminder={r} onToggle={() => toggleComplete(r.id)} onDelete={() => deleteReminder(r.id)} />
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">Completed ({completed.length})</p>
              <div className="space-y-2">
                {completed.map((r) => (
                  <ReminderCard key={r.id} reminder={r} onToggle={() => toggleComplete(r.id)} onDelete={() => deleteReminder(r.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReminderCard({ reminder, onToggle, onDelete }: { reminder: Reminder; onToggle: () => void; onDelete: () => void }) {
  const [showAttachments, setShowAttachments] = useState(false);
  const priorityColor = PRIORITIES.find((p) => p.value === reminder.priority)?.color || "bg-amber-500";
  const isOverdue = reminder.due_date && !reminder.completed && isPast(new Date(reminder.due_date + "T23:59:59"));
  const isDueToday = reminder.due_date && isToday(new Date(reminder.due_date + "T00:00:00"));

  return (
    <div className={cn(
      "rounded-2xl border transition-all animate-fade-in",
      reminder.completed
        ? "border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 opacity-60"
        : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    )}>
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={onToggle}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            reminder.completed
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-zinc-300 dark:border-zinc-600 hover:border-blue-500"
          )}
        >
          {reminder.completed && <Check className="h-3.5 w-3.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium", reminder.completed && "line-through text-zinc-400 dark:text-zinc-500")}>
            {reminder.title}
          </p>
          {reminder.due_date && (
            <p className={cn("mt-0.5 text-[10px] font-medium",
              isOverdue ? "text-red-500" : isDueToday ? "text-blue-600 dark:text-blue-400" : "text-zinc-400"
            )}>
              {isOverdue ? "Overdue \u2014 " : isDueToday ? "Today \u2014 " : ""}
              {format(new Date(reminder.due_date + "T00:00:00"), "MMM d, yyyy")}
            </p>
          )}
        </div>

        <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", priorityColor)} />

        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            showAttachments ? "text-blue-600 bg-blue-50 dark:bg-blue-950/30" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <Paperclip className="h-3.5 w-3.5" />
        </button>

        <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {showAttachments && (
        <div className="px-3 pb-3 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-0">
          <div className="pt-3">
            <Attachments parentType="reminder" parentId={reminder.id} compact />
          </div>
        </div>
      )}
    </div>
  );
}
