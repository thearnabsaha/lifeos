import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getDb, toObjectId } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

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

    const doc = await db.collection("attachments").findOneAndDelete(query as any);

    if (doc && doc.file_url) {
      try {
        await del(doc.file_url);
      } catch {}
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete attachment error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
