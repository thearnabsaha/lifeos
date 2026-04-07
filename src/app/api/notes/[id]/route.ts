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
    const { title, content, pinned } = await req.json();
    const result = await sql`
      UPDATE notes SET
        title = COALESCE(${title ?? null}, title),
        content = COALESCE(${content ?? null}, content),
        pinned = COALESCE(${pinned ?? null}, pinned),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, title, content, pinned, created_at, updated_at
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    return NextResponse.json({ note: result[0] });
  } catch (err) {
    console.error("Update note error:", err);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
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
    await sql`DELETE FROM notes WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete note error:", err);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
