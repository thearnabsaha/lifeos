import { NextRequest, NextResponse } from "next/server";
import { getDb, toObjectId, formatDoc } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();

    const db = await getDb();
    const targetId = toObjectId(id);
    const query =
      typeof targetId === "string"
        ? { $or: [{ _id: targetId }, { id: targetId }], user_id: userId }
        : { _id: targetId, user_id: userId };

    const updateFields: Record<string, any> = { updated_at: new Date() };
    if (body.title !== undefined) updateFields.title = body.title;
    if (body.completed !== undefined) updateFields.completed = body.completed;
    if (body.due_date !== undefined) updateFields.due_date = body.due_date;
    if (body.schedule !== undefined) updateFields.schedule = body.schedule;
    if (body.recurrence !== undefined) updateFields.recurrence = body.recurrence;
    if (body.priority !== undefined) updateFields.priority = body.priority;
    if (body.order !== undefined) updateFields.order = body.order;

    const result = await db
      .collection("todos")
      .findOneAndUpdate(query as any, { $set: updateFields }, { returnDocument: "after" });

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ todo: formatDoc(result) });
  } catch (err) {
    console.error("Update todo error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
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
    const db = await getDb();
    const targetId = toObjectId(id);
    const query =
      typeof targetId === "string"
        ? { $or: [{ _id: targetId }, { id: targetId }], user_id: userId }
        : { _id: targetId, user_id: userId };

    await db.collection("todos").deleteOne(query as any);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete todo error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
