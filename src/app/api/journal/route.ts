import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const rows = await sql`
      SELECT id, date, mood, content, ai_generated, created_at, updated_at
      FROM journal_entries WHERE user_id = ${userId}
      ORDER BY date DESC LIMIT 30
    `;
    return NextResponse.json({ entries: rows });
  } catch (err) {
    console.error("List journal error:", err);
    return NextResponse.json({ error: "Failed to fetch journal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { date, mood, content, ai_generated } = await req.json();
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    const result = await sql`
      INSERT INTO journal_entries (user_id, date, mood, content, ai_generated)
      VALUES (${userId}, ${date}, ${mood || ""}, ${content || ""}, ${ai_generated || false})
      ON CONFLICT (user_id, date)
      DO UPDATE SET mood = ${mood || ""}, content = ${content || ""}, ai_generated = ${ai_generated || false}, updated_at = NOW()
      RETURNING id, date, mood, content, ai_generated, created_at, updated_at
    `;
    return NextResponse.json({ entry: result[0] });
  } catch (err) {
    console.error("Save journal error:", err);
    return NextResponse.json({ error: "Failed to save journal" }, { status: 500 });
  }
}
