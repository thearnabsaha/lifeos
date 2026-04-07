import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { date, hour, content } = await req.json();

    if (!date || hour === undefined || content === undefined) {
      return NextResponse.json(
        { error: "date, hour, and content are required" },
        { status: 400 }
      );
    }

    if (hour < 0 || hour > 23) {
      return NextResponse.json(
        { error: "Hour must be between 0 and 23" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO time_entries (user_id, date, hour, content)
      VALUES (${userId}, ${date}, ${hour}, ${content})
      ON CONFLICT (user_id, date, hour)
      DO UPDATE SET content = ${content}, updated_at = NOW()
      RETURNING id, hour, content, date, updated_at
    `;

    return NextResponse.json({ entry: result[0] });
  } catch (err) {
    console.error("Upsert entry error:", err);
    return NextResponse.json(
      { error: "Failed to save entry" },
      { status: 500 }
    );
  }
}
