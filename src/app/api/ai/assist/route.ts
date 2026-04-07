import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getUserId, unauthorized } from "@/lib/auth";

const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
] as const;

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

async function tryModel(
  client: Groq,
  model: string,
  messages: Groq.Chat.ChatCompletionMessageParam[]
): Promise<string | null> {
  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });
    return response.choices[0]?.message?.content || null;
  } catch (err) {
    console.error(`Model ${model} failed:`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return unauthorized();

  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const client = getGroqClient();
    if (!client) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are a helpful productivity assistant. Provide concise, actionable insights about the user's day and productivity patterns.",
      },
      {
        role: "user",
        content: context ? `Context: ${context}\n\n${prompt}` : prompt,
      },
    ];

    for (const model of MODELS) {
      const result = await tryModel(client, model, messages);
      if (result) {
        return NextResponse.json({ result, model });
      }
    }

    return NextResponse.json(
      { error: "All AI models are currently unavailable" },
      { status: 503 }
    );
  } catch (err) {
    console.error("AI assist error:", err);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}
