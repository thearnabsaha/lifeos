import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { date } = await params;
    const result = await sql`
      SELECT id, date, mood, content, ai_generated, created_at, updated_at
      FROM journal_entries WHERE user_id = ${userId} AND date = ${date}
    `;
    return NextResponse.json({ entry: result[0] || null });
  } catch (err) {
    console.error("Get journal entry error:", err);
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { date } = await params;
    await sql`DELETE FROM journal_entries WHERE user_id = ${userId} AND date = ${date}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete journal entry error:", err);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
