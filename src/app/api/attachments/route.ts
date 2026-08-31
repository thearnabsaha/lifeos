import { NextRequest, NextResponse } from "next/server";
import { getDb, formatDoc } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  const parentType = req.nextUrl.searchParams.get("parentType");
  const parentId = req.nextUrl.searchParams.get("parentId");

  if (!parentType || !parentId) {
    return NextResponse.json(
      { error: "parentType and parentId required" },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    const rows = await db
      .collection("attachments")
      .find({ user_id: userId, parent_type: parentType, parent_id: parentId })
      .sort({ created_at: -1 })
      .toArray();

    return NextResponse.json({
      attachments: rows.map((r) => formatDoc(r)),
    });
  } catch (err) {
    console.error("List attachments error:", err);
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 }
    );
  }
}
