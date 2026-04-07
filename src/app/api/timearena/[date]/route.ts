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

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT id, hour, content, date, updated_at
      FROM time_entries
      WHERE user_id = ${userId} AND date = ${date}
      ORDER BY hour ASC
    `;

    const entryMap: Record<number, (typeof rows)[0]> = {};
    rows.forEach((e) => {
      entryMap[e.hour] = e;
    });

    const entries = Array.from({ length: 24 }, (_, hour) => ({
      id: entryMap[hour]?.id ?? null,
      hour,
      content: entryMap[hour]?.content ?? "",
      date,
      updatedAt: entryMap[hour]?.updated_at ?? null,
    }));

    return NextResponse.json({ entries });
  } catch (err) {
    console.error("Get entries error:", err);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}
