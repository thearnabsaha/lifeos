import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const rows = await sql`
      SELECT id, title, due_date, completed, priority, created_at, updated_at
      FROM reminders WHERE user_id = ${userId}
      ORDER BY completed ASC, due_date ASC NULLS LAST, created_at DESC
    `;
    return NextResponse.json({ reminders: rows });
  } catch (err) {
    console.error("List reminders error:", err);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { id, title, due_date, priority } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const result = id
      ? await sql`
          INSERT INTO reminders (id, user_id, title, due_date, priority)
          VALUES (${id}, ${userId}, ${title}, ${due_date || null}, ${priority || "medium"})
          ON CONFLICT (id) DO UPDATE SET title = ${title}, due_date = ${due_date || null}, priority = ${priority || "medium"}, updated_at = NOW()
          RETURNING id, title, due_date, completed, priority, created_at, updated_at
        `
      : await sql`
          INSERT INTO reminders (user_id, title, due_date, priority)
          VALUES (${userId}, ${title}, ${due_date || null}, ${priority || "medium"})
          RETURNING id, title, due_date, completed, priority, created_at, updated_at
        `;
    return NextResponse.json({ reminder: result[0] }, { status: 201 });
  } catch (err) {
    console.error("Create reminder error:", err);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
