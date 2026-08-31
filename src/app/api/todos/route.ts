import { NextRequest, NextResponse } from "next/server";
import { getDb, toObjectId, formatDoc } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const db = await getDb();
    const rows = await db
      .collection("todos")
      .find({ user_id: userId })
      .sort({ completed: 1, order: 1, created_at: -1 })
      .toArray();

    return NextResponse.json({
      todos: rows.map((r) => formatDoc(r)),
    });
  } catch (err) {
    console.error("List todos error:", err);
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { id, title, due_date, schedule, recurrence, priority, completed, order } =
      await req.json();

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

      const existing = await db.collection("todos").findOne(query as any);
      if (existing) {
        const updateDoc = {
          $set: {
            title: title.trim(),
            due_date: due_date || null,
            schedule: schedule || "today",
            recurrence: recurrence || null,
            priority: priority || "medium",
            completed: completed || false,
            order: order || 0,
            updated_at: now,
          },
        };

        const updated = await db
          .collection("todos")
          .findOneAndUpdate(query as any, updateDoc, { returnDocument: "after" });

        return NextResponse.json({ todo: formatDoc(updated) });
      }
    }

    const newTodo = {
      user_id: userId,
      title: title.trim(),
      due_date: due_date || null,
      schedule: schedule || "today",
      recurrence: recurrence || null,
      priority: priority || "medium",
      completed: completed || false,
      order: order || 0,
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection("todos").insertOne(newTodo);
    return NextResponse.json(
      {
        todo: {
          id: result.insertedId.toString(),
          ...newTodo,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Create todo error:", err);
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}
