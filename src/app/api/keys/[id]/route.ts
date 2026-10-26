import { NextRequest, NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/auth";
import { revokeApiKey } from "@/lib/mcpKeys";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const { id } = await params;
  const ok = await revokeApiKey(userId, id);
  return NextResponse.json({ revoked: ok }, { status: ok ? 200 : 404 });
}
