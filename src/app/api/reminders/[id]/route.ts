import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();
    const result = await sql`
      UPDATE reminders SET
        title = COALESCE(${body.title ?? null}, title),
        due_date = COALESCE(${body.due_date ?? null}, due_date),
        completed = COALESCE(${body.completed ?? null}, completed),
        priority = COALESCE(${body.priority ?? null}, priority),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, title, due_date, completed, priority, created_at, updated_at
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }
    return NextResponse.json({ reminder: result[0] });
  } catch (err) {
    console.error("Update reminder error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { id } = await params;
    await sql`DELETE FROM reminders WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete reminder error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
