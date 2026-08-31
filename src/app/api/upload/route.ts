import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getDb } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const parentType = formData.get("parentType") as string;
    const parentId = formData.get("parentId") as string;

    if (!file || !parentType || !parentId) {
      return NextResponse.json(
        { error: "file, parentType, and parentId are required" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "";
    const filename = `${userId}/${parentType}/${parentId}/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    let fileType = "other";
    if (file.type.startsWith("image/")) fileType = "image";
    else if (file.type.startsWith("audio/")) fileType = "audio";
    else if (file.type === "application/pdf") fileType = "pdf";

    const db = await getDb();
    const now = new Date();
    const doc = {
      user_id: userId,
      parent_type: parentType,
      parent_id: parentId,
      file_name: file.name,
      file_url: blob.url,
      file_type: fileType,
      file_size: file.size,
      mime_type: file.type,
      created_at: now,
    };

    const result = await db.collection("attachments").insertOne(doc);

    return NextResponse.json(
      {
        attachment: {
          id: result.insertedId.toString(),
          ...doc,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
