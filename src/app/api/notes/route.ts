import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const rows = await sql`
      SELECT id, title, content, pinned, created_at, updated_at
      FROM notes WHERE user_id = ${userId}
      ORDER BY pinned DESC, updated_at DESC
    `;
    return NextResponse.json({ notes: rows });
  } catch (err) {
    console.error("List notes error:", err);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { id, title, content, pinned } = await req.json();
    const result = id
      ? await sql`
          INSERT INTO notes (id, user_id, title, content, pinned)
          VALUES (${id}, ${userId}, ${title || ""}, ${content || ""}, ${pinned || false})
          ON CONFLICT (id) DO UPDATE SET title = ${title || ""}, content = ${content || ""}, pinned = ${pinned || false}, updated_at = NOW()
          RETURNING id, title, content, pinned, created_at, updated_at
        `
      : await sql`
          INSERT INTO notes (user_id, title, content, pinned)
          VALUES (${userId}, ${title || ""}, ${content || ""}, ${pinned || false})
          RETURNING id, title, content, pinned, created_at, updated_at
        `;
    return NextResponse.json({ note: result[0] }, { status: 201 });
  } catch (err) {
    console.error("Create note error:", err);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
