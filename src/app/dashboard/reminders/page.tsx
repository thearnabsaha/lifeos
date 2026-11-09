"use client";

import { useEffect, useState } from "react";
import { useRemindersStore, Reminder } from "@/store/remindersStore";
import { Attachments } from "@/components/Attachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, ReceiptCard, SectionLabel, EmptyState, Chip, Tag, Tear } from "@/components/receipt";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Check, X, Paperclip } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

const PRIORITIES: { value: Reminder["priority"]; dot: string; label: string }[] = [
  { value: "low", dot: "bg-success", label: "Low" },
  { value: "medium", dot: "bg-amber-500", label: "Med" },
  { value: "high", dot: "bg-destructive", label: "High" },
];

export default function RemindersPage() {
  const { reminders, isLoading, fetchReminders, addReminder, toggleComplete, deleteReminder } = useRemindersStore();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Reminder["priority"]>("medium");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchReminders(); }, []);

  function handleAdd() {
    if (!title.trim()) return;
    addReminder(title.trim(), dueDate || undefined, priority);
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setShowAdd(false);
  }

  const upcoming = reminders
    .filter((r) => !r.completed)
    .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
  const completed = reminders.filter((r) => r.completed);
  const overdue = upcoming.filter((r) => r.due_date && isPast(new Date(r.due_date.slice(0, 10) + "T23:59:59"))).length;

  return (
    <div className="mx-auto w-full max-w-[680px] px-4 pt-6">
      <PageHeader
        label={`${String(upcoming.length).padStart(2, "0")} open · ${String(completed.length).padStart(2, "0")} done${overdue ? ` · ${overdue} overdue` : ""}`}
        title="Reminders"
        subtitle="Small things, written down once."
        action={
          <Button size="lg" className="h-10 rounded-lg px-4" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? <X className="size-4" /> : <Plus className="size-4" />}
            {showAdd ? "Close" : "New"}
          </Button>
        }
      />

      {showAdd && (
        <ReceiptCard className="mb-6" print>
          <p className="mono-label">New reminder</p>
          <Input
            className="mt-3 h-11"
            placeholder="What do you need to remember?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="date"
              aria-label="Due date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 flex-1 rounded-lg border bg-background px-3 font-mono text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
            <div className="flex gap-1.5" role="radiogroup" aria-label="Priority">
              {PRIORITIES.map((p) => (
                <Chip key={p.value} active={priority === p.value} onClick={() => setPriority(p.value)} role="radio" aria-checked={priority === p.value}>
                  <span className={cn("size-1.5 rounded-full", p.dot)} />
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>
          <Tear />
          <Button className="h-10 w-full rounded-lg" onClick={handleAdd} disabled={!title.trim()}>
            Add reminder →
          </Button>
        </ReceiptCard>
      )}

      {isLoading && reminders.length === 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b px-4 py-3.5 last:border-b-0">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <EmptyState label="0 open · 0 done" line="All clear. Nothing to remember right now.">
          <Button variant="outline" className="h-9 rounded-lg px-4" onClick={() => setShowAdd(true)}>
            <Plus className="size-4" /> New reminder
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-6 pb-6">
          {upcoming.length > 0 && (
            <section className="lr-rise">
              <SectionLabel count={upcoming.length}>Upcoming</SectionLabel>
              <div className="overflow-hidden rounded-xl border bg-card shadow-[0_1px_3px_#0000000d]">
                {upcoming.map((r) => (
                  <ReminderRow key={r.id} reminder={r} onToggle={() => toggleComplete(r.id)} onDelete={() => deleteReminder(r.id)} />
                ))}
              </div>
            </section>
          )}
          {upcoming.length === 0 && (
            <EmptyState label={`0 open · ${completed.length} done`} line="Everything's done. Nice." />
          )}
          {completed.length > 0 && (
            <section className="lr-rise">
              <SectionLabel count={completed.length}>Completed</SectionLabel>
              <div className="overflow-hidden rounded-xl border border-dashed">
                {completed.map((r) => (
                  <ReminderRow key={r.id} reminder={r} onToggle={() => toggleComplete(r.id)} onDelete={() => deleteReminder(r.id)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ReminderRow({ reminder, onToggle, onDelete }: { reminder: Reminder; onToggle: () => void; onDelete: () => void }) {
  const [showAttachments, setShowAttachments] = useState(false);
  const p = PRIORITIES.find((x) => x.value === reminder.priority) ?? PRIORITIES[1];
  const due = reminder.due_date ? reminder.due_date.slice(0, 10) : null;
  const isOverdue = due && !reminder.completed && isPast(new Date(due + "T23:59:59"));
  const isDueToday = due && isToday(new Date(due + "T00:00:00"));

  return (
    <div className="border-b last:border-b-0">
      <div className={cn("flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40", reminder.completed && "opacity-60")}>
        <button
          type="button"
          onClick={onToggle}
          aria-label={reminder.completed ? "Mark as not done" : "Mark as done"}
          className="flex size-9 shrink-0 items-center justify-center"
        >
          <span
            className={cn(
              "flex size-5 items-center justify-center rounded-full border transition-colors",
              reminder.completed ? "border-success bg-success text-white" : "border-foreground/30 hover:border-foreground"
            )}
          >
            {reminder.completed && <Check className="size-3" strokeWidth={3} />}
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm font-medium", reminder.completed && "text-muted-foreground line-through")}>
            {reminder.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Tag>
              <span className={cn("size-1.5 rounded-full", p.dot)} />
              {p.label}
            </Tag>
            {due && (
              <Tag
                className={cn(
                  isOverdue && "border-destructive/40 text-destructive",
                  isDueToday && !reminder.completed && "border-primary bg-primary text-primary-foreground"
                )}
              >
                {isOverdue ? "Overdue · " : isDueToday ? "Today · " : ""}
                {format(new Date(due + "T00:00:00"), "MMM d")}
              </Tag>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAttachments(!showAttachments)}
          aria-label="Attachments"
          aria-expanded={showAttachments}
          className={cn(
            "flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            showAttachments && "bg-muted text-foreground"
          )}
        >
          <Paperclip className="size-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete reminder"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      {showAttachments && (
        <div className="tear mx-3 pb-3 pt-3">
          <Attachments parentType="reminder" parentId={reminder.id} compact />
        </div>
      )}
    </div>
  );
}
