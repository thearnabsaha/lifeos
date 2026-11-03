import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function signToken(userId: string): string {
  // Persistent session: no expiry. A login stays valid until the user
  // logs out manually (which clears the token client-side), or until
  // JWT_SECRET is rotated. Do not reintroduce a short expiry here.
  return jwt.sign({ userId }, JWT_SECRET);
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export function getUserId(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const payload = verifyToken(header.slice(7));
  return payload?.userId ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
