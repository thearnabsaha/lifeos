import { NextRequest, NextResponse } from "next/server";
import { getDb, toObjectId, formatDoc } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const db = await getDb();
    const rows = await db
      .collection("reminders")
      .find({ user_id: userId })
      .sort({ completed: 1, due_date: 1, created_at: -1 })
      .toArray();

    return NextResponse.json({
      reminders: rows.map((r) => formatDoc(r)),
    });
  } catch (err) {
    console.error("List reminders error:", err);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { id, title, due_date, priority } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();

    if (id) {
      const targetId = toObjectId(id);
      const query =
        typeof targetId === "string"
          ? { $or: [{ _id: targetId }, { id: targetId }], user_id: userId }
          : { _id: targetId, user_id: userId };

      const existing = await db.collection("reminders").findOne(query as any);
      if (existing) {
        const updateDoc = {
          $set: {
            title: title.trim(),
            due_date: due_date || null,
            priority: priority || "medium",
            updated_at: now,
          },
        };
        const updated = await db
          .collection("reminders")
          .findOneAndUpdate(query as any, updateDoc, { returnDocument: "after" });
        return NextResponse.json({ reminder: formatDoc(updated) });
      }
    }

    const newReminder = {
      user_id: userId,
      title: title.trim(),
      due_date: due_date || null,
      completed: false,
      priority: priority || "medium",
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection("reminders").insertOne(newReminder);
    return NextResponse.json(
      {
        reminder: {
          id: result.insertedId.toString(),
          ...newReminder,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create reminder error:", err);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
