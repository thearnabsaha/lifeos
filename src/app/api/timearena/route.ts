import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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

    const db = await getDb();
    const now = new Date();
    const filter = { user_id: userId, date, hour };
    const update = {
      $set: { content, updated_at: now },
      $setOnInsert: { created_at: now },
    };

    const result = await db.collection("time_entries").findOneAndUpdate(
      filter,
      update,
      { upsert: true, returnDocument: "after" }
    );

    const doc = result;
    const entry = doc
      ? {
          id: doc._id.toString(),
          hour: doc.hour,
          content: doc.content,
          date: doc.date,
          updated_at: doc.updated_at,
        }
      : {
          id: `${userId}_${date}_${hour}`,
          hour,
          content,
          date,
          updated_at: now,
        };

    return NextResponse.json({ entry });
  } catch (err) {
    console.error("Upsert entry error:", err);
    return NextResponse.json(
      { error: "Failed to save entry" },
      { status: 500 }
    );
  }
}
