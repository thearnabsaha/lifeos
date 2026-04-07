import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
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
      return NextResponse.json({ error: "file, parentType, and parentId are required" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
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

    const result = await sql`
      INSERT INTO attachments (user_id, parent_type, parent_id, file_name, file_url, file_type, file_size, mime_type)
      VALUES (${userId}, ${parentType}, ${parentId}, ${file.name}, ${blob.url}, ${fileType}, ${file.size}, ${file.type})
      RETURNING id, file_name, file_url, file_type, file_size, mime_type, created_at
    `;

    return NextResponse.json({ attachment: result[0] }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
