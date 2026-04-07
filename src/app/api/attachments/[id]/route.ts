import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { id } = await params;
    const result = await sql`
      DELETE FROM attachments WHERE id = ${id} AND user_id = ${userId}
      RETURNING file_url
    `;
    if (result.length > 0 && result[0].file_url) {
      try { await del(result[0].file_url); } catch {}
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete attachment error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
