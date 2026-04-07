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
      UPDATE todos SET
        title = COALESCE(${body.title ?? null}, title),
        completed = COALESCE(${body.completed ?? null}, completed),
        due_date = COALESCE(${body.due_date ?? null}, due_date),
        schedule = COALESCE(${body.schedule ?? null}, schedule),
        recurrence = COALESCE(${body.recurrence ?? null}, recurrence),
        priority = COALESCE(${body.priority ?? null}, priority),
        "order" = COALESCE(${body.order ?? null}, "order"),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ todo: result[0] });
  } catch (err) {
    console.error("Update todo error:", err);
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
    await sql`DELETE FROM todos WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete todo error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
