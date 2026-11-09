import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { firstError, validateLoginFields } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Accept `email` or legacy `username` field name from older clients.
    const email = body?.email ?? body?.username;
    const password = body?.password;

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const fieldErrors = validateLoginFields(email, password);
    const message = firstError(fieldErrors);
    if (message) {
      return NextResponse.json(
        { error: message, fields: fieldErrors },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDb();
    const user = await db.collection("users").findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const userId = user._id.toString();
    const token = signToken(userId);
    return NextResponse.json({
      token,
      user: { id: userId, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}
