import { NextRequest, NextResponse } from "next/server";
import { getUserId, unauthorized } from "@/lib/auth";
import { createApiKey, listApiKeys } from "@/lib/mcpKeys";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json({ keys: await listApiKeys(userId) });
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.slice(0, 60) : "MCP key";
  return NextResponse.json({ key: await createApiKey(userId, name) }, { status: 201 });
}
