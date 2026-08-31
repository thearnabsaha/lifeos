import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

function formatTimeSlot(hour: number): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const nextHour = (hour + 1) % 24;
  return `${pad(hour)}:00 - ${pad(nextHour)}:00`;
}

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  // If field contains quotes, commas, or newlines, wrap in quotes and double internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const db = await getDb();
    
    // Fetch user details for the header/filename
    const user = await db.collection("users").findOne({ _id: userId as any });
    
    // Fetch all time entries for user sorted chronologically
    const entries = await db
      .collection("time_entries")
      .find({ user_id: userId })
      .sort({ date: 1, hour: 1 })
      .toArray();

    // CSV Headers
    const headers = [
      "Date",
      "Hour",
      "Time Slot",
      "Logged Activity",
      "Last Updated"
    ];

    const rows: string[] = [];
    rows.push(headers.map(escapeCsvField).join(","));

    for (const entry of entries) {
      const row = [
        entry.date || "",
        entry.hour !== undefined ? String(entry.hour).padStart(2, "0") : "",
        entry.hour !== undefined ? formatTimeSlot(entry.hour) : "",
        entry.content || "",
        entry.updated_at ? new Date(entry.updated_at).toISOString() : ""
      ];
      rows.push(row.map(escapeCsvField).join(","));
    }

    // UTF-8 BOM (\uFEFF) ensures Excel automatically recognizes UTF-8 encoding
    const csvContent = "\uFEFF" + rows.join("\r\n");
    const today = new Date().toISOString().split("T")[0];
    const filename = `LifeOS_TimeArena_${today}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
