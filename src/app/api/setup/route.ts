import { NextRequest, NextResponse } from "next/server";
import { ensureTables } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-setup-secret");
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await ensureTables();
    return NextResponse.json({ status: "ok", message: "Tables created" });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json(
      { error: "Failed to create tables" },
      { status: 500 }
    );
  }
}
