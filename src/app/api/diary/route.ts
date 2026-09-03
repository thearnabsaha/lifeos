import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";
import { generateAiDiary } from "@/lib/aiSummarizer";

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const db = await getDb();

    if (date) {
      const entry = await db.collection("journal_entries").findOne({
        user_id: userId,
        date,
      });

      return NextResponse.json({ diary: entry ? { ...entry, id: entry._id.toString() } : null });
    }

    // Return list of recent diary entries
    const entries = await db
      .collection("journal_entries")
      .find({ user_id: userId })
      .sort({ date: -1 })
      .limit(30)
      .toArray();

    return NextResponse.json({
      diaries: entries.map((e) => ({ ...e, id: e._id.toString() })),
    });
  } catch (err) {
    console.error("Fetch diary error:", err);
    return NextResponse.json({ error: "Failed to fetch diary" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { date, regenerate } = await req.json();
    if (!date) {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    const db = await getDb();

    // Check if an entry already exists and user is not requesting a re-generation
    if (!regenerate) {
      const existing = await db.collection("journal_entries").findOne({
        user_id: userId,
        date,
      });
      if (existing) {
        return NextResponse.json({ diary: { ...existing, id: existing._id.toString() } });
      }
    }

    // Fetch time entries for this date
    const timeDocs = await db
      .collection("time_entries")
      .find({ user_id: userId, date })
      .sort({ hour: 1 })
      .toArray();

    const slots = timeDocs.map((d) => ({
      hour: d.hour,
      content: d.content || "",
    }));

    // Generate with free AI engine (zero API key required)
    const diaryData = await generateAiDiary(date, slots);
    const now = new Date();

    const updateDoc = {
      $set: {
        title: diaryData.title,
        mood: diaryData.mood,
        summary: diaryData.summary,
        highlights: diaryData.highlights,
        stats: diaryData.stats,
        updated_at: now,
      },
      $setOnInsert: {
        user_id: userId,
        date,
        created_at: now,
      },
    };

    const result = await db.collection("journal_entries").findOneAndUpdate(
      { user_id: userId, date },
      updateDoc,
      { upsert: true, returnDocument: "after" }
    );

    const doc = result;
    const entry = doc
      ? { ...doc, id: doc._id.toString() }
      : { ...diaryData, user_id: userId, created_at: now, updated_at: now };

    return NextResponse.json({ diary: entry });
  } catch (err) {
    console.error("Generate diary error:", err);
    return NextResponse.json({ error: "Failed to generate diary" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { date, summary, title, mood } = await req.json();
    if (!date || summary === undefined) {
      return NextResponse.json({ error: "date and summary are required" }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();

    const update: any = { summary, updated_at: now };
    if (title) update.title = title;
    if (mood) update.mood = mood;

    const result = await db.collection("journal_entries").findOneAndUpdate(
      { user_id: userId, date },
      { $set: update, $setOnInsert: { user_id: userId, date, created_at: now } },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json({ diary: result ? { ...result, id: result._id.toString() } : null });
  } catch (err) {
    console.error("Update diary error:", err);
    return NextResponse.json({ error: "Failed to update diary" }, { status: 500 });
  }
}
