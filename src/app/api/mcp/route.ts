import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { ObjectId, type Filter, type Document } from "mongodb";
import { getDb, formatDoc } from "@/lib/db";
import { verifyApiKey } from "@/lib/mcpKeys";
import { generateAiDiary } from "@/lib/aiSummarizer";

export const maxDuration = 60;

type Ctx = { http?: { authInfo?: { extra?: Record<string, unknown> } } };
const uid = (ctx: unknown) => {
  const u = (ctx as Ctx)?.http?.authInfo?.extra?.userId;
  if (typeof u !== "string") throw new Error("Unauthorized");
  return u;
};
const ok = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] });
const err = (msg: string) => ({ content: [{ type: "text" as const, text: msg }], isError: true });
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Date as YYYY-MM-DD");
// "Today" in the user's timezone (LIFEOS_TZ, default Asia/Kolkata) so it matches the app's local dates.
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: process.env.LIFEOS_TZ || "Asia/Kolkata" }).format(new Date());
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const byId = (userId: string, id: string): Filter<Document> =>
  ObjectId.isValid(id) ? { _id: new ObjectId(id), user_id: userId } : { _id: id as unknown as ObjectId, user_id: userId };

async function daySlots(userId: string, date: string) {
  const db = await getDb();
  const rows = await db.collection("time_entries").find({ user_id: userId, date }).toArray();
  const map = new Map(rows.map((r) => [r.hour as number, (r.content as string) ?? ""]));
  return Array.from({ length: 24 }, (_, hour) => ({ hour, content: map.get(hour) ?? "" }));
}

const handler = createMcpHandler(
  (server) => {
    // ---------- Time Arena ----------
    server.registerTool("get_day", {
      title: "Get Time Arena day",
      description: "Get all 24 hourly Time Arena slots (hour 0-23 → what the user did) for a date. Defaults to today in the user's timezone.",
      inputSchema: z.object({ date: dateStr.optional(), onlyFilled: z.boolean().optional().describe("Only return non-empty slots") }),
    }, async (a, ctx) => {
      const date = a.date ?? today();
      const slots = await daySlots(uid(ctx), date);
      return ok({ date, filled: slots.filter((s) => s.content.trim()).length, slots: a.onlyFilled ? slots.filter((s) => s.content.trim()) : slots });
    });

    server.registerTool("set_slots", {
      title: "Set Time Arena slots",
      description: "Set or overwrite one or more hourly slots for a date. Pass content \"\" to clear a slot. Ask the user before overwriting existing content.",
      inputSchema: z.object({
        date: dateStr.optional(),
        slots: z.array(z.object({ hour: z.number().int().min(0).max(23), content: z.string().max(2000) })).min(1),
      }),
    }, async (a, ctx) => {
      const userId = uid(ctx); const date = a.date ?? today();
      const db = await getDb(); const now = new Date();
      for (const s of a.slots) {
        await db.collection("time_entries").findOneAndUpdate(
          { user_id: userId, date, hour: s.hour },
          { $set: { content: s.content, updated_at: now }, $setOnInsert: { created_at: now } },
          { upsert: true }
        );
      }
      return ok({ date, updated: a.slots.length, slots: (await daySlots(userId, date)).filter((s) => s.content.trim()) });
    });

    // ---------- Diary ----------
    const diaryOut = (d: Document | null) => d && { id: d._id?.toString(), date: d.date, title: d.title, mood: d.mood, summary: d.summary, highlights: d.highlights, stats: d.stats, updatedAt: d.updated_at };

    server.registerTool("list_diary_entries", {
      title: "List diary entries", description: "List recent AI Diary entries, newest first, optionally within a date range.",
      inputSchema: z.object({ from: dateStr.optional(), to: dateStr.optional(), limit: z.number().int().min(1).max(100).optional() }),
    }, async (a, ctx) => {
      const db = await getDb(); const q: Document = { user_id: uid(ctx) };
      if (a.from || a.to) q.date = { ...(a.from ? { $gte: a.from } : {}), ...(a.to ? { $lte: a.to } : {}) };
      const rows = await db.collection("journal_entries").find(q).sort({ date: -1 }).limit(a.limit ?? 20).toArray();
      return ok(rows.map((r) => ({ date: r.date, title: r.title, mood: r.mood, summary: String(r.summary ?? "").slice(0, 280) })));
    });

    server.registerTool("search_diary", {
      title: "Search diary", description: "Case-insensitive text search across diary titles, summaries and highlights.",
      inputSchema: z.object({ query: z.string().min(1), limit: z.number().int().min(1).max(50).optional() }),
    }, async (a, ctx) => {
      const db = await getDb(); const re = { $regex: esc(a.query), $options: "i" };
      const rows = await db.collection("journal_entries").find({ user_id: uid(ctx), $or: [{ title: re }, { summary: re }, { highlights: re }] }).sort({ date: -1 }).limit(a.limit ?? 10).toArray();
      return ok(rows.map(diaryOut));
    });

    server.registerTool("get_diary_entry", {
      title: "Get diary entry", description: "Get the full diary entry for a date (default today).",
      inputSchema: z.object({ date: dateStr.optional() }),
    }, async (a, ctx) => {
      const db = await getDb();
      const d = await db.collection("journal_entries").findOne({ user_id: uid(ctx), date: a.date ?? today() });
      return d ? ok(diaryOut(d)) : err("No diary entry for that date. Use create_diary_entry to write or generate one.");
    });

    server.registerTool("create_diary_entry", {
      title: "Create diary entry",
      description: "Create a diary entry for a date. If `summary` is given it is saved as written; otherwise the free built-in summarizer generates one from that day's Time Arena slots (same as the app's AI Diary button). Fails if an entry exists unless overwrite=true.",
      inputSchema: z.object({ date: dateStr.optional(), summary: z.string().optional(), title: z.string().optional(), mood: z.string().optional(), overwrite: z.boolean().optional() }),
    }, async (a, ctx) => {
      const userId = uid(ctx); const date = a.date ?? today();
      const db = await getDb(); const now = new Date();
      const existing = await db.collection("journal_entries").findOne({ user_id: userId, date });
      if (existing && !a.overwrite) return err("An entry already exists for this date. Use update_diary_entry or overwrite=true.");
      const gen = a.summary ? null : await generateAiDiary(date, await daySlots(userId, date));
      const set = gen
        ? { title: a.title ?? gen.title, mood: a.mood ?? gen.mood, summary: gen.summary, highlights: gen.highlights, stats: gen.stats, updated_at: now }
        : { title: a.title ?? "Diary", mood: a.mood ?? "neutral", summary: a.summary, updated_at: now };
      const r = await db.collection("journal_entries").findOneAndUpdate(
        { user_id: userId, date },
        { $set: set, $setOnInsert: { user_id: userId, date, created_at: now } },
        { upsert: true, returnDocument: "after" }
      );
      return ok(diaryOut(r));
    });

    server.registerTool("update_diary_entry", {
      title: "Update diary entry", description: "Edit the diary entry for a date. Only provided fields change.",
      inputSchema: z.object({ date: dateStr, summary: z.string().optional(), title: z.string().optional(), mood: z.string().optional() }),
    }, async (a, ctx) => {
      const db = await getDb();
      const set: Document = { updated_at: new Date() };
      for (const k of ["summary", "title", "mood"] as const) if (a[k] !== undefined) set[k] = a[k];
      const r = await db.collection("journal_entries").findOneAndUpdate({ user_id: uid(ctx), date: a.date }, { $set: set }, { returnDocument: "after" });
      return r ? ok(diaryOut(r)) : err("No diary entry for that date.");
    });

    // ---------- Reminders ----------
    const prio = z.enum(["low", "medium", "high"]);
    server.registerTool("list_reminders", {
      title: "List reminders", description: "List reminders. By default only open ones.",
      inputSchema: z.object({ includeCompleted: z.boolean().optional() }),
    }, async (a, ctx) => {
      const db = await getDb(); const q: Document = { user_id: uid(ctx) };
      if (!a.includeCompleted) q.completed = { $ne: true };
      const rows = await db.collection("reminders").find(q).sort({ completed: 1, due_date: 1, created_at: -1 }).toArray();
      return ok(rows.map((r) => formatDoc(r)));
    });

    server.registerTool("create_reminder", {
      title: "Create reminder", description: "Create a reminder.",
      inputSchema: z.object({ title: z.string().min(1), due_date: z.string().optional().describe("YYYY-MM-DD or ISO datetime"), priority: prio.optional() }),
    }, async (a, ctx) => {
      const db = await getDb(); const now = new Date();
      const doc = { user_id: uid(ctx), title: a.title.trim(), due_date: a.due_date ?? null, completed: false, priority: a.priority ?? "medium", created_at: now, updated_at: now };
      const r = await db.collection("reminders").insertOne(doc);
      return ok({ id: r.insertedId.toString(), ...doc });
    });

    server.registerTool("update_reminder", {
      title: "Update reminder", description: "Edit a reminder. Only provided fields change.",
      inputSchema: z.object({ id: z.string(), title: z.string().optional(), due_date: z.string().nullable().optional(), priority: prio.optional(), completed: z.boolean().optional() }),
    }, async (a, ctx) => {
      const db = await getDb(); const { id, ...rest } = a;
      const set: Document = { updated_at: new Date() };
      for (const [k, v] of Object.entries(rest)) if (v !== undefined) set[k] = v;
      const r = await db.collection("reminders").findOneAndUpdate(byId(uid(ctx), id), { $set: set }, { returnDocument: "after" });
      return r ? ok(formatDoc(r)) : err("Reminder not found");
    });

    server.registerTool("complete_reminder", {
      title: "Complete reminder", description: "Mark a reminder done (or undone with completed=false).",
      inputSchema: z.object({ id: z.string(), completed: z.boolean().optional() }),
    }, async (a, ctx) => {
      const db = await getDb();
      const r = await db.collection("reminders").findOneAndUpdate(byId(uid(ctx), a.id), { $set: { completed: a.completed ?? true, updated_at: new Date() } }, { returnDocument: "after" });
      return r ? ok(formatDoc(r)) : err("Reminder not found");
    });

    server.registerTool("delete_reminder", {
      title: "Delete reminder", description: "Permanently delete a reminder. Ask the user first.",
      inputSchema: z.object({ id: z.string() }),
    }, async (a, ctx) => {
      const db = await getDb();
      const r = await db.collection("reminders").deleteOne(byId(uid(ctx), a.id));
      return r.deletedCount ? ok({ deleted: true, id: a.id }) : err("Reminder not found");
    });

    // ---------- Summary ----------
    server.registerTool("get_daily_summary", {
      title: "Daily summary",
      description: "One-shot overview of a day: logged Time Arena slots, the diary entry (if any), open reminders and those due that day.",
      inputSchema: z.object({ date: dateStr.optional() }),
    }, async (a, ctx) => {
      const userId = uid(ctx); const date = a.date ?? today(); const db = await getDb();
      const slots = (await daySlots(userId, date)).filter((s) => s.content.trim());
      const diary = await db.collection("journal_entries").findOne({ user_id: userId, date });
      const open = await db.collection("reminders").find({ user_id: userId, completed: { $ne: true } }).sort({ due_date: 1 }).toArray();
      return ok({
        date,
        timeArena: { hoursLogged: slots.length, slots },
        diary: diaryOut(diary),
        reminders: {
          open: open.length,
          dueThisDay: open.filter((r) => typeof r.due_date === "string" && r.due_date.startsWith(date)).map((r) => formatDoc(r)),
          overdue: open.filter((r) => typeof r.due_date === "string" && r.due_date.slice(0, 10) < date).map((r) => formatDoc(r)),
        },
      });
    });
  },
  { serverInfo: { name: "lifeos", version: "1.0.0" } },
);

const authed = withMcpAuth(handler, async (_req, token) => {
  if (!token) return undefined;
  const userId = await verifyApiKey(token);
  if (!userId) return undefined;
  return { token, clientId: userId, scopes: [], extra: { userId } };
}, { required: true });

export { authed as GET, authed as POST, authed as DELETE };
