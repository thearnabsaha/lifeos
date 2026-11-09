import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { firstError, validateSignupFields } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email ?? body?.username;
    const password = body?.password;
    const name = body?.name;
    const confirmPassword = body?.confirmPassword;

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const fieldErrors = validateSignupFields(
      email,
      password,
      typeof name === "string" ? name : "",
      typeof confirmPassword === "string" ? confirmPassword : undefined
    );
    const message = firstError(fieldErrors);
    if (message) {
      return NextResponse.json(
        { error: message, fields: fieldErrors },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDb();

    const existing = await db.collection("users").findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const result = await db.collection("users").insertOne({
      email: normalizedEmail,
      password: hashedPassword,
      name: trimmedName || null,
      created_at: now,
      updated_at: now,
    });

    const user = {
      id: result.insertedId.toString(),
      email: normalizedEmail,
      name: trimmedName || null,
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
