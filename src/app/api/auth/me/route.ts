import { NextRequest, NextResponse } from "next/server";
import { getDb, toObjectId } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const db = await getDb();
    const targetId = toObjectId(userId);
    const query = typeof targetId === "string" ? { $or: [{ _id: targetId }, { id: targetId }] } : { _id: targetId };
    const user = await db.collection("users").findOne(query as any);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error("Me error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
