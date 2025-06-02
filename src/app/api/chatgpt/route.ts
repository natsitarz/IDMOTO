import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { question, userInfo, systemPrompt } = await req.json();
  if (!question) return NextResponse.json({ error: "No question provided" }, { status: 400 });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system" as const, content: systemPrompt || "You are IDMOTO AI, an expert car assistant." },
        ...(userInfo ? [{ role: "system" as const, content: `User info: ${userInfo}` }] : []),
        { role: "user" as const, content: question }
      ],
      max_tokens: 512,
    });
    return NextResponse.json({ answer: completion.choices[0].message.content });
  } catch (err) {
  console.error("OpenAI error:", err);
  return NextResponse.json({ error: "OpenAI error" }, { status: 500 });
}
}