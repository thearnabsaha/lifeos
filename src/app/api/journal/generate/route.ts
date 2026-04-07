import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { sql } from "@/lib/db";
import { getUserId, unauthorized } from "@/lib/auth";

const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"] as const;

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { date } = await req.json();
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const entries = await sql`
      SELECT hour, content FROM time_entries
      WHERE user_id = ${userId} AND date = ${date} AND content != ''
      ORDER BY hour ASC
    `;

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No time entries found for this date. Log some hours first!" },
        { status: 400 }
      );
    }

    const timeLog = entries
      .map((e) => `${String(e.hour).padStart(2, "0")}:00 — ${e.content}`)
      .join("\n");

    const groq = new Groq({ apiKey });

    for (const model of MODELS) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are a thoughtful journal writer. Given a person's hourly time log for the day, write a reflective, first-person journal entry (2-3 paragraphs). Be warm, introspective, and highlight patterns or accomplishments. Don't list hours mechanically — weave them into a narrative.",
            },
            {
              role: "user",
              content: `Here is my time log for ${date}:\n\n${timeLog}\n\nWrite a journal entry for this day.`,
            },
          ],
          temperature: 0.8,
          max_tokens: 1024,
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          return NextResponse.json({ content, model });
        }
      } catch (err) {
        console.error(`Model ${model} failed:`, err);
      }
    }

    return NextResponse.json({ error: "AI models unavailable" }, { status: 503 });
  } catch (err) {
    console.error("Generate journal error:", err);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
