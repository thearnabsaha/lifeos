import { NextRequest, NextResponse } from "next/server";
import { getDb, formatDoc } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const db = await getDb();
    const rows = await db
      .collection("journal_entries")
      .find({ user_id: userId })
      .sort({ date: -1 })
      .limit(30)
      .toArray();

    return NextResponse.json({
      entries: rows.map((r) => formatDoc(r)),
    });
  } catch (err) {
    console.error("List journal error:", err);
    return NextResponse.json({ error: "Failed to fetch journal" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { date, mood, content } = await req.json();

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();
    const filter = { user_id: userId, date };
    const update = {
      $set: {
        mood: mood || "",
        content: content || "",
        updated_at: now,
      },
      $setOnInsert: {
        created_at: now,
      },
    };

    const result = await db
      .collection("journal_entries")
      .findOneAndUpdate(filter, update, { upsert: true, returnDocument: "after" });

    return NextResponse.json({ entry: formatDoc(result) });
  } catch (err) {
    console.error("Save journal error:", err);
    return NextResponse.json({ error: "Failed to save journal" }, { status: 500 });
  }
}
