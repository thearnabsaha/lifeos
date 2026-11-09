import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // The identifier can be a plain username or an email.
    const email = body?.email ?? body?.username;
    const { password, name } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (/\s/.test(normalizedEmail) || normalizedEmail.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters with no spaces" },
        { status: 400 }
      );
    }
    const db = await getDb();

    const existing = await db.collection("users").findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "Username or email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();
    const result = await db.collection("users").insertOne({
      email: normalizedEmail,
      password: hashedPassword,
      name: name?.trim() || null,
      created_at: now,
      updated_at: now,
    });

    const user = {
      id: result.insertedId.toString(),
      email: normalizedEmail,
      name: name?.trim() || null,
    };
    const token = signToken(user.id);
    return NextResponse.json({ token, user }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
