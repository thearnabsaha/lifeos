import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  const parentType = req.nextUrl.searchParams.get("parentType");
  const parentId = req.nextUrl.searchParams.get("parentId");

  if (!parentType || !parentId) {
    return NextResponse.json({ error: "parentType and parentId required" }, { status: 400 });
  }

  try {
    const rows = await sql`
      SELECT id, file_name, file_url, file_type, file_size, mime_type, created_at
      FROM attachments
      WHERE user_id = ${userId} AND parent_type = ${parentType} AND parent_id = ${parentId}
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ attachments: rows });
  } catch (err) {
    console.error("List attachments error:", err);
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 });
  }
}
