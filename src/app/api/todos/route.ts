import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const rows = await sql`
      SELECT id, title, completed, due_date, schedule, recurrence, priority, "order", created_at, updated_at
      FROM todos
      WHERE user_id = ${userId}
      ORDER BY completed ASC, "order" ASC, created_at DESC
    `;
    return NextResponse.json({ todos: rows });
  } catch (err) {
    console.error("List todos error:", err);
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { id, title, due_date, schedule, recurrence, priority, completed, order } = await req.json();
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (id) {
      const existing = await sql`SELECT id FROM todos WHERE id = ${id} AND user_id = ${userId}`;
      if (existing.length > 0) {
        const updated = await sql`
          UPDATE todos SET title = ${title}, due_date = ${due_date || null}, schedule = ${schedule || "today"},
            recurrence = ${recurrence || null}, priority = ${priority || "medium"}, completed = ${completed || false},
            "order" = ${order || 0}, updated_at = NOW()
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *
        `;
        return NextResponse.json({ todo: updated[0] });
      }
    }

    const result = await sql`
      INSERT INTO todos (user_id, title, due_date, schedule, recurrence, priority, "order")
      VALUES (${userId}, ${title}, ${due_date || null}, ${schedule || "today"}, ${recurrence || null}, ${priority || "medium"}, ${order || 0})
      RETURNING *
    `;
    return NextResponse.json({ todo: result[0] }, { status: 201 });
  } catch (err) {
    console.error("Create todo error:", err);
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}
