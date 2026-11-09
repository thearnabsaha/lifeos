import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

// TEMPORARY one-off migration: renames the owner's login. Removed right after use.
const TOKEN_SHA256 = "cd9242e353560e3254c7527e09fc71210474553e3ee0a1d77f9b2d9e2f6c4187";
const FROM = "arnab.b.saha@pwc.com";
const TO = "arnab";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-migrate-token") || "";
  const a = createHash("sha256").update(token).digest();
  const b = Buffer.from(TOKEN_SHA256, "hex");
  if (!token || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const dryRun = req.nextUrl.searchParams.get("dry") === "1";
  const db = await getDb();
  const users = db.collection("users");
  const user = await users.findOne({ email: FROM });
  const clash = await users.findOne({ email: TO });
  if (!user) {
    return NextResponse.json({ error: "source user not found", alreadyRenamed: !!clash, renamedId: clash?._id?.toString() }, { status: 404 });
  }
  if (clash) return NextResponse.json({ error: "target username already exists" }, { status: 409 });
  const backup = { _id: user._id.toString(), email: user.email, password: user.password, name: user.name ?? null, updated_at: user.updated_at ?? null };
  if (dryRun) return NextResponse.json({ dryRun: true, backup, userCount: await users.countDocuments() });
  const hash = await bcrypt.hash("arnab", 12);
  const res = await users.updateOne({ _id: user._id, email: FROM }, { $set: { email: TO, password: hash, updated_at: new Date() } });
  return NextResponse.json({ ok: res.modifiedCount === 1, backup });
}
