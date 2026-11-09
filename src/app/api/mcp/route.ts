import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyApiKey } from "@/lib/mcpKeys";

export const maxDuration = 60;

type Ctx = { http?: { authInfo?: { extra?: Record<string, unknown> } } };
const uid = (ctx: unknown) => {
  const u = (ctx as Ctx)?.http?.authInfo?.extra?.userId;
  if (typeof u !== "string") throw new Error("Unauthorized");
  return u;
};
const ok = (data: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] });
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Date as YYYY-MM-DD");
// "Today" in the user's timezone (LIFEOS_TZ, default Asia/Kolkata) so it matches the app's local dates.
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: process.env.LIFEOS_TZ || "Asia/Kolkata" }).format(new Date());

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

    // ---------- Summary ----------
    server.registerTool("get_daily_summary", {
      title: "Daily summary",
      description: "One-shot overview of a day: logged Time Arena slots and hours filled.",
      inputSchema: z.object({ date: dateStr.optional() }),
    }, async (a, ctx) => {
      const userId = uid(ctx); const date = a.date ?? today();
      const slots = (await daySlots(userId, date)).filter((s) => s.content.trim());
      return ok({
        date,
        timeArena: { hoursLogged: slots.length, slots },
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
